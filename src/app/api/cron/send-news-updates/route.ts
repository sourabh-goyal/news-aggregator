import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';
import type { Prisma } from '@prisma/client';

interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:' + process.env.VAPID_EMAIL,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Run every 5 minutes
export const revalidate = 300;

export async function GET() {
  try {
    // Get all push subscriptions
    const subscriptions = await prisma.$queryRaw<PushSubscriptionData[]>`
      SELECT * FROM "PushSubscription"
    `;

    // Get news from the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentNews = await prisma.article.findMany({
      where: {
        createdAt: {
          gte: fiveMinutesAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5 // Get top 5 most recent articles
    });

    if (recentNews.length === 0) {
      return NextResponse.json({ message: 'No new articles to send' });
    }

    // Create notification payload
    const notificationPayload = {
      title: 'Latest News Update',
      body: `Here are the latest ${recentNews.length} articles:\n\n${recentNews
        .map(article => `• ${article.title}`)
        .join('\n')}`,
      url: '/', // Link to the main page
      timestamp: new Date().toISOString()
    };

    // Send notifications to all subscribers
    const notifications = subscriptions.map((subscription: PushSubscriptionData) => {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth
        }
      };

      return webpush.sendNotification(
        pushSubscription,
        JSON.stringify(notificationPayload)
      ).catch(error => {
        console.error('Error sending notification:', error);
        // If the subscription is no longer valid, remove it
        if (error.statusCode === 410) {
          return prisma.$executeRaw`
            DELETE FROM "PushSubscription"
            WHERE endpoint = ${subscription.endpoint}
          `;
        }
      });
    });

    await Promise.all(notifications);

    return NextResponse.json({ 
      message: `Sent notifications to ${subscriptions.length} subscribers`,
      articlesCount: recentNews.length
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
} 