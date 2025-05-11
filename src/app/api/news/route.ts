import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { NEWS_SOURCES } from '@/types/news';
import Parser from 'rss-parser';

const parser = new Parser();
const prisma = new PrismaClient();

// Handle AWS Lambda cold starts
let prismaClient: PrismaClient | undefined;

export async function GET(request: Request) {
  try {
    // Initialize Prisma client if needed
    if (!prismaClient) {
      prismaClient = new PrismaClient();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '24');
    const keywords = searchParams.get('keywords')?.split(',') || [];
    const searchQuery = searchParams.get('search') || '';

    // Build the where clause
    const where: any = {};

    // Add keyword filter if keywords are selected
    if (keywords.length > 0) {
      where.keywords = {
        hasSome: keywords
      };
    }

    // Add search filter if search query exists
    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } }
      ];
    }

    // Get total count
    const total = await prismaClient.article.count({ where });

    // Get paginated articles
    const articles = await prismaClient.article.findMany({
      where,
      orderBy: {
        pubDate: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    return NextResponse.json({
      articles,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const newArticles = [];

    for (const source of NEWS_SOURCES) {
      try {
        const feed = await parser.parseURL(source.url);
        
        for (const item of feed.items) {
          const title = item.title || '';
          const description = item.contentSnippet || item.content || '';
          const content = item.content || '';
          
          // Extract keywords from title and description
          const keywords = new Set<string>();
          
          // Add source-specific keywords
          source.keywords.forEach((keyword: string) => {
            if (title.toLowerCase().includes(keyword.toLowerCase()) ||
                description.toLowerCase().includes(keyword.toLowerCase())) {
              keywords.add(keyword);
            }
          });
          


          // Extract image URL from content if available
          let imageUrl = null;
          if (content) {
            const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) {
              imageUrl = imgMatch[1];
            }
          }

          // Check if article already exists
          const existingArticle = await prisma.article.findFirst({
            where: {
              title: title,
              source: source.name
            }
          });

          if (!existingArticle) {
            newArticles.push({
              title,
              description,
              link: item.link || '',
              pubDate: new Date(item.pubDate || Date.now()),
              source: source.name,
              keywords: Array.from(keywords),
              imageUrl
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error);
      }
    }

    // Save new articles to database
    if (newArticles.length > 0) {
      await prisma.article.createMany({
        data: newArticles,
        skipDuplicates: true
      });
    }

    return NextResponse.json({
      message: `Added ${newArticles.length} new articles`
    });
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json(
      { error: 'Failed to update news' },
      { status: 500 }
    );
  }
} 