import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

// Check if VAPID keys are configured
if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_EMAIL) {
  console.error('VAPID keys not configured. Please set NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_EMAIL in your .env file');
} else {
  // Configure web-push with VAPID keys
  webpush.setVapidDetails(
    'mailto:' + process.env.VAPID_EMAIL,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request: Request) {
  try {
    // Check if VAPID keys are configured
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_EMAIL) {
      return NextResponse.json(
        { error: 'Push notifications not configured. Please set up VAPID keys.' },
        { status: 500 }
      );
    }

    // Get all push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany();

    // Get news from the last 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentNews = await prisma.article.findMany({
      where: {
        fetchTimestamp: {
          gte: thirtyMinutesAgo
        }
      },
      orderBy: {
        fetchTimestamp: 'desc'
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
    const notifications = subscriptions.map(subscription => {
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
          return prisma.pushSubscription.delete({
            where: { endpoint: subscription.endpoint }
          });
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