import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: {
        pubDate: 'desc'
      },
      take: 5,
      select: {
        title: true,
        link: true,
        pubDate: true
      }
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error getting recent articles:', error);
    return NextResponse.json(
      { error: 'Failed to get recent articles' },
      { status: 500 }
    );
  }
} 