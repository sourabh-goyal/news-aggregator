import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const count = await prisma.article.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error getting article count:', error);
    return NextResponse.json(
      { error: 'Failed to get article count' },
      { status: 500 }
    );
  }
} 