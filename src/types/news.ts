export interface Article {
  id: string;
  title: string;
  description?: string;
  link: string;
  pubDate: Date;
  publishedAt: Date;  // Original publication date from the source
  fetchedAt: Date;    // When we fetched the article
  source: string;
  keywords: string[];
  imageUrl?: string;
}

export interface NewsSource {
  name: string;
  url: string;
  keywords: string[];
}

// Keywords that should NOT appear in relevant news
export const EXCLUDED_KEYWORDS = [
  // Entertainment
  'bollywood', 'movie', 'film', 'actor', 'actress', 'celebrity', 'entertainment',
  'music', 'song', 'album', 'concert', 'performance', 'show', 'reality show',
  
  // Sports
  'cricket', 'football', 'soccer', 'hockey', 'tennis', 'sports', 'match',
  'tournament', 'championship', 'league', 'player', 'team', 'coach',
  
  // Business & Economy
  'stock market', 'share market', 'sensex', 'nifty', 'trading', 'investment',
  'business', 'economy', 'market', 'stock', 'share', 'profit', 'loss',
  
  // General Exclusions
  'weather', 'forecast', 'climate', 'temperature', 'rain', 'flood',
  'education', 'school', 'college', 'university', 'exam', 'result',
  'technology', 'gadget', 'mobile', 'phone', 'computer', 'software',
  'health', 'medical', 'hospital', 'doctor', 'patient', 'disease',
  'lifestyle', 'fashion', 'beauty', 'food', 'recipe', 'cooking'
];

export const NEWS_KEYWORDS = [
  // India-Pakistan Specific (Primary Terms)
  'india pakistan conflict', 'india pakistan border', 'india pakistan tension',
  'indian pakistani forces', 'indian pakistani military', 'indian pakistani army',
  'loc', 'line of control', 'international border', 'ceasefire line',
  'jammu kashmir conflict', 'pok', 'pakistan occupied kashmir',
  
  // Military Actions (Secondary Terms)
  'ceasefire violation', 'border skirmish', 'cross border firing', 'shelling',
  'artillery fire', 'mortar shelling', 'bombardment', 'retaliatory fire',
  'military operation', 'surgical strike', 'counter terrorism operation',
  'terrorist attack', 'militant attack', 'infiltration attempt',
  
  // Key Locations (Tertiary Terms)
  'jammu', 'srinagar', 'muzaffarabad', 'skardu', 'gilgit',
  'punjab border', 'rajasthan border', 'gujarat border',
  
  // Military Units (Tertiary Terms)
  'border security force', 'bsf', 'pakistan rangers', 'pakistan army',
  'indian army', 'indian air force', 'pakistan air force',
  
  // Diplomatic Terms (Tertiary Terms)
  'ceasefire agreement', 'peace talks', 'dialogue', 'de-escalation',
  'foreign secretary talks', 'high commissioner', 'diplomatic tension',
  
  // Key Figures (Tertiary Terms)
  'modi', 'sharif', 'imran khan', 'jaishankar', 'bajwa', 'munir',
  'rawat', 'naravane', 'chauhan', 'asif', 'qureshi',
  
  // Incidents (Secondary Terms)
  'cross border terrorism', 'proxy war', 'sleeper cell',
  'drone attack', 'radar detection', 'airspace violation',
  
  // Casualties & Damage (Tertiary Terms)
  'civilian casualty', 'military casualty', 'injured', 'wounded',
  'damage', 'destruction', 'evacuation', 'displacement'
];

export const NEWS_SOURCES: NewsSource[] = [
  {
    name: 'Economic Times',
    url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms',
    keywords: NEWS_KEYWORDS
  },
  {
    name: 'NDTV',
    url: 'https://feeds.feedburner.com/ndtvnews-top-stories',
    keywords: NEWS_KEYWORDS
  },
  {
    name: 'CNN',
    url: 'http://rss.cnn.com/rss/edition.rss',
    keywords: NEWS_KEYWORDS
  },
  {
    name: 'BBC',
    url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    keywords: NEWS_KEYWORDS
  },
  {
    name: 'MoneyControl',
    url: 'https://www.moneycontrol.com/rss/latestnews.xml',
    keywords: NEWS_KEYWORDS
  },
  {
    name: 'The Hindu',
    url: 'https://www.thehindu.com/news/national/feeder/default.rss',
    keywords: NEWS_KEYWORDS
  },
  {
    name: 'Times of India',
    url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
    keywords: NEWS_KEYWORDS
  },
  {
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    keywords: NEWS_KEYWORDS
  },
  // {
  //   name: 'Dawn',
  //   url: 'https://www.dawn.com/feed/',
  //   keywords: NEWS_KEYWORDS
  // },
  // {
  //   name: 'The Express Tribune',
  //   url: 'https://tribune.com.pk/feed/',
  //   keywords: NEWS_KEYWORDS
  // },
  // {
  //   name: 'Reuters',
  //   url: 'https://www.reutersagency.com/feed/?best-topics=world&post_type=best',
  //   keywords: NEWS_KEYWORDS
  // },
  // {
  //   name: 'Associated Press',
  //   url: 'https://www.ap.org/feeds/feed.rss',
  //   keywords: NEWS_KEYWORDS
  // },
  {
    name: 'The Guardian',
    url: 'https://www.theguardian.com/world/rss',
    keywords: NEWS_KEYWORDS
  },
  {
    name: 'The Indian Express',
    url: 'https://indianexpress.com/feed/',
    keywords: NEWS_KEYWORDS
  },
  // {
  //   name: 'The Wire',
  //   url: 'https://thewire.in/rss/',
  //   keywords: NEWS_KEYWORDS
  // }
]; 