import ClientHome from './ClientHome';
import type { Metadata } from 'next';
import { Article } from '@/types/news';

// Dynamic SEO metadata
export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch('/api/news');
    const data = await res.json();
    const articles: Article[] = data.articles || [];

    // General, keyword-rich title
    const generalTitle = 'India Pakistan War News, LOC Updates, Ceasefire Violations & Global Response';

    // General description with a short compilation of latest headlines
    const mainTopics = 'Get the latest updates on the India Pakistan war, border tensions, LOC news, ceasefire violations, military actions, and global diplomatic response.';
    const latestHeadlines = articles.slice(0, 3).map(a => a.title).filter(Boolean).join(' | ');
    const description = latestHeadlines
      ? `${mainTopics} Latest headlines: ${latestHeadlines}`
      : mainTopics;

    // Most common keywords from latest news
    const keywordCounts: Record<string, number> = {};
    articles.forEach(a => a.keywords.forEach(k => { keywordCounts[k] = (keywordCounts[k] || 0) + 1; }));
    const sortedKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k);

    // Add some trending queries
    const trending = [
      'India Pakistan war news',
      'LOC updates',
      'ceasefire violation today',
      'Kashmir conflict',
      'global response to India Pakistan war',
      'latest military updates',
      'border news',
      'diplomatic talks',
      'breaking news India Pakistan',
    ];

    const imageUrl = '/indian-flag.png';

    return {
      title: generalTitle,
      description,
      keywords: [...sortedKeywords.slice(0, 20), ...trending].join(', '),
      openGraph: {
        title: generalTitle,
        description,
        type: 'website',
        url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        siteName: 'India Pakistan War News Aggregator',
        images: [
          {
            url: imageUrl,
            width: 512,
            height: 512,
            alt: 'Indian Flag',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: generalTitle,
        description,
        images: [imageUrl],
        site: '@yourtwitterhandle',
      },
    };
  } catch (error) {
    // Fallback metadata
    return {
      title: "India-Pakistan War News Aggregator",
      description: "Latest updates and global response to the India-Pakistan conflict.",
      keywords: "India Pakistan war, LOC updates, ceasefire violations, global response, military actions, border tensions, diplomatic talks, Kashmir conflict, latest news",
      openGraph: {
        title: "India-Pakistan War News Aggregator",
        description: "Latest updates and global response to the India-Pakistan conflict.",
        type: 'website',
        url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        siteName: 'India Pakistan War News Aggregator',
        images: [
          {
            url: '/indian-flag.png',
            width: 512,
            height: 512,
            alt: 'Indian Flag',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: "India-Pakistan War News Aggregator",
        description: "Latest updates and global response to the India-Pakistan conflict.",
        images: ['/indian-flag.png'],
        site: '@yourtwitterhandle',
      },
    };
  }
}

export default function Page() {
  return <ClientHome />;
} 