import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get all articles and extract unique keywords
    const articles = await prisma.article.findMany({
      select: {
        keywords: true
      }
    });

    // Count occurrences of each keyword
    const keywordCounts = new Map<string, number>();
    articles.forEach(article => {
      article.keywords.forEach(keyword => {
        keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
      });
    });

    // Convert to array and sort by count (descending) and then alphabetically
    const keywordsWithCounts = Array.from(keywordCounts.entries())
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1]; // Sort by count first
        return a[0].localeCompare(b[0]); // Then alphabetically
      })
      .map(([keyword, count]) => ({ keyword, count }));

    return NextResponse.json({ keywords: keywordsWithCounts });
  } catch (error) {
    console.error('Error fetching keywords:', error);
    return NextResponse.json({ error: 'Failed to fetch keywords' }, { status: 500 });
  }
} 