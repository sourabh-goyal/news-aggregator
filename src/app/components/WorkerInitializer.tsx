import { headers } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import Parser from 'rss-parser';
import { NEWS_SOURCES } from '@/types/news';

// Handle AWS Lambda cold starts
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

const parser = new Parser();

const CORE_WORDS = [
  'india', 'pakistan', 'war', 'border', 'loc', 'kashmir', 'ceasefire', 'military', 'army', 'operation sindoor'
];

// Keep track of the last fetch time
let lastFetchTime = 0;
const FETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

async function fetchNews() {
  console.log('🔄 Starting to fetch news from all sources...');
  try {
    const newArticles = [];

    for (const source of NEWS_SOURCES) {
      console.log(`📰 Fetching from source: ${source.name}`);
      try {
        const feed = await parser.parseURL(source.url);
        console.log(`✅ Successfully fetched ${feed.items.length} items from ${source.name}`);
        
        for (const item of feed.items) {
          // Check if article matches at least one keyword or core word
          const content = `${item.title || ''} ${item.contentSnippet || item.content || ''}`.toLowerCase();
          const matchedKeywords = source.keywords.filter(keyword => content.includes(keyword.toLowerCase()));
          const matchesCore = CORE_WORDS.some(word => content.includes(word));
          if (matchedKeywords.length === 0 && !matchesCore) continue; // Skip if no keyword or core word matches

          // Extract image URL from common RSS fields
          let imageUrl = '';
          if (item.enclosure && item.enclosure.url) {
            imageUrl = item.enclosure.url;
          } else if (item['media:content'] && item['media:content'].url) {
            imageUrl = item['media:content'].url;
          } else if (item.image) {
            imageUrl = item.image;
          } else if (item.thumbnail) {
            imageUrl = item.thumbnail;
          } else if (item.content) {
            const match = item.content.match(/<img[^>]+src=["']([^"'>]+)["']/i);
            if (match) imageUrl = match[1];
          }

          const existingArticle = await prisma.article.findUnique({
            where: { link: item.link }
          });

          if (!existingArticle && item.link) {
            const article = await prisma.article.create({
              data: {
                title: item.title || '',
                description: item.contentSnippet || item.content || '',
                link: item.link,
                pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                source: source.name,
                keywords: matchedKeywords.length > 0 ? matchedKeywords : CORE_WORDS.filter(word => content.includes(word)),
                imageUrl: imageUrl || undefined
              }
            });
            newArticles.push(article);
            console.log(`📝 Added new article: ${article.title}`);
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(`❌ Error fetching from ${source.name}:`, error.message);
        } else {
          console.error(`❌ Error fetching from ${source.name}:`, error);
        }
      }
    }

    console.log('📊 News update successful:', { newArticlesCount: newArticles.length });
    return { success: true, newArticlesCount: newArticles.length };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Error updating news:', error.message);
      return { success: false, error: error.message };
    } else {
      console.error('❌ Error updating news:', error);
      return { success: false, error: 'Unknown error occurred' };
    }
  }
}

async function scheduleNextFetch() {
  const now = Date.now();
  if (now - lastFetchTime < FETCH_INTERVAL) {
    console.log('⏳ Skipping fetch - too soon since last fetch');
    return;
  }

  console.log('⏰ Scheduling next fetch...');
  lastFetchTime = now;
  await fetchNews();

  // Schedule next fetch
  console.log(`⏰ Next fetch scheduled in ${FETCH_INTERVAL/1000/300} minutes`);
  setTimeout(scheduleNextFetch, FETCH_INTERVAL);
}

// This is a server component
export default async function WorkerInitializer() {
  console.log('🚀 WorkerInitializer component mounted');
  
  // Get the current request headers
  const headersList = headers();
  console.log('🔍 Request headers:', Object.fromEntries(headersList.entries()));

  // Start the worker if it hasn't been started yet
  if (lastFetchTime === 0) {
    console.log('🎯 First time initialization - starting worker');
    // Start the initial fetch
    await fetchNews();
    // Schedule the next fetch
    scheduleNextFetch();
  } else {
    console.log('🔄 Worker already running, skipping initialization');
  }

  // This component doesn't render anything
  return null;
} 