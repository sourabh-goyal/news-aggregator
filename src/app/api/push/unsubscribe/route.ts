import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const subscription = await request.json();

    // Remove the subscription from the database
    await prisma.pushSubscription.delete({
      where: {
        endpoint: subscription.endpoint,
      },
    });

    return NextResponse.json({ message: 'Subscription removed successfully' });
  } catch (error) {
    console.error('Error removing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
} 