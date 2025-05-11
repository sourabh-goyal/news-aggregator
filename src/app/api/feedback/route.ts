import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { type, message } = await req.json();
    if (!type || !message) {
      return NextResponse.json({ error: 'Type and message are required.' }, { status: 400 });
    }
    const feedback = await prisma.feedback.create({
      data: { type, message }
    });
    return NextResponse.json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
} 