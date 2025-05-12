import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Parser from 'rss-parser';
import { NEWS_SOURCES, NEWS_KEYWORDS, EXCLUDED_KEYWORDS } from '@/types/news';

const prisma = new PrismaClient();
const parser = new Parser({
  timeout: 60000, // Increase timeout to 60 seconds
  maxRedirects: 5, // Allow up to 5 redirects
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml;q=0.9, */*;q=0.8'
  }
});

// Keep track of the last fetch time globally
let lastFetchTime = 0;
const FETCH_INTERVAL = 5 * 60 * 1000; // 300 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Function to fetch feed with retries
async function fetchFeedWithRetry(source: { name: string; url: string }, retryCount = 0): Promise<any> {
  try {
    console.log(`📰 Fetching from source: ${source.name} (${source.url}) - Attempt ${retryCount + 1}`);
    const feed = await parser.parseURL(source.url);
    return feed;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`⚠️ Retry ${retryCount + 1} for ${source.name} after error:`, error instanceof Error ? error.message : error);
      await delay(RETRY_DELAY);
      return fetchFeedWithRetry(source, retryCount + 1);
    }
    throw error;
  }
}

// Function to check if content is relevant
function isContentRelevant(content: string, keywords: string[]): boolean {
  const lowerContent = content.toLowerCase();
  
  // First check for excluded keywords - if any are found, article is not relevant
  if (EXCLUDED_KEYWORDS.some(keyword => lowerContent.includes(keyword.toLowerCase()))) {
    return false;
  }
  
  // Must contain at least one primary term (India-Pakistan specific)
  const primaryTerms = [
    'india pakistan conflict', 'india pakistan border', 'india pakistan tension',
    'indian pakistani forces', 'indian pakistani military', 'indian pakistani army',
    'loc', 'line of control', 'international border', 'ceasefire line',
    'jammu kashmir conflict', 'pok', 'pakistan occupied kashmir'
  ];
  const hasPrimaryContext = primaryTerms.some(term => lowerContent.includes(term));
  
  if (!hasPrimaryContext) {
    return false;
  }
  
  // Must also contain at least one secondary term (military/conflict related)
  const secondaryTerms = [
    'ceasefire violation', 'border skirmish', 'cross border firing', 'shelling',
    'artillery fire', 'mortar shelling', 'bombardment', 'retaliatory fire',
    'military operation', 'surgical strike', 'counter terrorism operation',
    'terrorist attack', 'militant attack', 'infiltration attempt',
    'cross border terrorism', 'proxy war', 'sleeper cell',
    'drone attack', 'radar detection', 'airspace violation'
  ];
  const hasSecondaryContext = secondaryTerms.some(term => lowerContent.includes(term));
  
  return hasSecondaryContext;
}

export async function POST() {
  const now = Date.now();
  const fetchStartTime = new Date();
  
  // Check if it's too soon since the last fetch
  if (now - lastFetchTime < FETCH_INTERVAL) {
    console.log('⏳ Skipping fetch - too soon since last fetch');
    return NextResponse.json({ 
      success: true, 
      skipped: true,
      message: 'Worker already running, skipping initialization',
      nextFetchIn: Math.ceil((FETCH_INTERVAL - (now - lastFetchTime)) / 1000) + ' seconds'
    });
  }

  console.log('🚀 Worker initialization API called at:', fetchStartTime.toISOString());
  lastFetchTime = now;
  
  try {
    const newArticles = [];
    const fetchStats = {
      totalFeeds: NEWS_SOURCES.length,
      processedFeeds: 0,
      totalArticles: 0,
      relevantArticles: 0,
      newArticles: 0,
      errors: 0,
      retries: 0
    };

    for (const source of NEWS_SOURCES) {
      try {
        const feed = await fetchFeedWithRetry(source);
        fetchStats.totalArticles += feed.items.length;
        console.log(`✅ Successfully fetched ${feed.items.length} items from ${source.name}`);
        
        for (const item of feed.items) {
          // Combine title and content for better relevance checking
          const content = `${item.title || ''} ${item.contentSnippet || item.content || ''}`;
          
          // Skip if content is not relevant
          if (!isContentRelevant(content, source.keywords)) {
            console.log(`⏭️ Skipping irrelevant article: ${item.title}`);
            continue;
          }
          
          fetchStats.relevantArticles++;

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
            // Find matched keywords
            const matchedKeywords = source.keywords.filter(keyword => 
              content.toLowerCase().includes(keyword.toLowerCase())
            );

            const article = await prisma.article.create({
              data: {
                title: item.title || '',
                description: item.contentSnippet || item.content || '',
                link: item.link,
                pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                source: source.name,
                keywords: matchedKeywords,
                imageUrl: imageUrl || undefined
              }
            });
            newArticles.push(article);
            fetchStats.newArticles++;
            console.log(`📝 Added new article: ${article.title}`);
          }
        }
        fetchStats.processedFeeds++;
      } catch (error) {
        console.error(`❌ Error fetching from ${source.name} (${source.url}):`, error);
        if (error instanceof Error) {
          console.error(`Error details: ${error.message}`);
          if (error.stack) {
            console.error(`Stack trace: ${error.stack}`);
          }
        }
        fetchStats.errors++;
      }
    }

    const fetchEndTime = new Date();
    const fetchDuration = fetchEndTime.getTime() - fetchStartTime.getTime();

    console.log('📊 News update successful:', {
      fetchStartTime: fetchStartTime.toISOString(),
      fetchEndTime: fetchEndTime.toISOString(),
      fetchDuration: `${fetchDuration}ms`,
      stats: fetchStats,
      newArticlesCount: newArticles.length
    });

    return NextResponse.json({ 
      success: true, 
      newArticlesCount: newArticles.length,
      message: `Successfully processed ${newArticles.length} new articles`,
      nextFetchIn: '300 seconds',
      stats: {
        ...fetchStats,
        fetchStartTime: fetchStartTime.toISOString(),
        fetchEndTime: fetchEndTime.toISOString(),
        fetchDuration: `${fetchDuration}ms`
      }
    });
  } catch (error) {
    console.error('❌ Error in worker initialization:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 