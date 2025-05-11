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

// Single array of keywords to be used across all news sources
export const NEWS_KEYWORDS = [
  // Military & Defense
  'military', 'army', 'navy', 'air force', 'defense', 'armed forces', 'paramilitary',
  'battle', 'war', 'conflict', 'combat', 'operation', 'mission', 'deployment',
  'soldier', 'troops', 'personnel', 'martyr', 'casualty', 'wounded', 'injured',
  'weapon', 'artillery', 'missile', 'drone', 'aircraft', 'tank', 'submarine',
  'nuclear', 'atomic', 'strategic', 'tactical', 'offensive', 'defensive', 'explosion', 'panic', 'security', 'coast',
  'terrorist', 'militant', 'militancy', 'insurgency', 'separatist', 'jihad', 'proxy war',
  
  
  // Border & LOC
  'border', 'loc', 'line of control', 'international border', 'ceasefire line',
  'violation', 'breach', 'infiltration', 'intrusion', 'cross border',
  'shelling', 'firing', 'artillery', 'mortar', 'grenade', 'bombardment',
  'bunker', 'post', 'outpost', 'checkpoint', 'patrol', 'surveillance',
  
  // Kashmir Related
  'kashmir', 'jammu', 'pok', 'pakistan occupied kashmir', 'gilgit', 'baltistan',
  'article 370', 'special status', 'autonomy', 'statehood', 'union territory',
  'kashmiri', 'kashmiris', 'pandit', 'minority', 'migration', 'displacement',
  
  // Terrorism & Security
  'terrorism', 'terrorist', 'militant', 'militancy', 'insurgency', 'separatist',
  'attack', 'ambush', 'encounter', 'raid', 'operation', 'crackdown',
  'isi', 'raw', 'intelligence', 'espionage', 'surveillance', 'interception',
  'radical', 'extremist', 'jihad', 'proxy war', 'sleeper cell',
  
  // Diplomatic & Political
  'diplomatic', 'diplomacy', 'foreign policy', 'external affairs',
  'modi', 'sharif', 'imran khan', 'shah', 'foreign minister',
  'talks', 'negotiation', 'summit', 'meeting', 'dialogue',
  'peace', 'treaty', 'agreement', 'ceasefire', 'de-escalation',
  'sanctions', 'aid', 'assistance', 'support', 'alliance',
  'diplomat', 'ambassador', 'consulate', 'embassy', 'high commission',
  'bilateral', 'multilateral', 'international relations', 'foreign relations',
  'state visit', 'official visit', 'delegation', 'delegates', 'representatives',
  
  // Political Figures
  'trump', 'biden', 'putin', 'xi jinping', 'erdogan', 'macron',
  'jaishankar', 'blinken', 'guterres', 'boris johnson', 'sunak',
  'raheel sharif', 'bajwa', 'munir', 'asif', 'qureshi',
  'rajnath singh', 'doval', 'rawat', 'naravane', 'chauhan',
  
  // Countries & Regions
  'pakistan', 'pak', 'india', 'china', 'russia', 'usa', 'united states',
  'uk', 'britain', 'france', 'germany', 'turkey', 'saudi arabia',
  'uae', 'qatar', 'iran', 'afghanistan', 'bangladesh', 'nepal',
  'sri lanka', 'bhutan', 'myanmar', 'central asia', 'south asia',
  'middle east', 'gulf', 'europe', 'asia', 'america',
  
  // International Response
  'un', 'united nations', 'security council', 'international',
  'us', 'america', 'china', 'russia', 'global', 'world',
  'mediation', 'intervention', 'peacekeeping', 'resolution',
  'nato', 'european union', 'eu', 'g20', 'g7', 'brics',
  'saarc', 'sco', 'oic', 'arab league', 'gcc',
  
  // Regional
  'punjab', 'sindh', 'balochistan', 'gilgit', 'baltistan',
  'ladakh', 'jammu', 'srinagar', 'bordering', 'frontier',
  'khyber pakhtunkhwa', 'fata', 'tribal areas', 'northern areas',
  'azad kashmir', 'muzaffarabad', 'mirpur', 'skardu', 'hunza',
  
  // Humanitarian
  'civilian', 'refugee', 'displaced', 'migration', 'evacuation',
  'humanitarian', 'aid', 'relief', 'assistance', 'support',
  'casualty', 'injury', 'damage', 'destruction', 'reconstruction',
  'internally displaced', 'asylum', 'resettlement', 'rehabilitation',
  
  // Media & Information
  'propaganda', 'disinformation', 'fake news', 'media war',
  'press release', 'statement', 'briefing', 'update',
  'breaking news', 'exclusive', 'report', 'analysis',
  'correspondent', 'news agency',
  'press conference', 'media briefing', 'official statement', 'whistleblower',  'alert', 'shut', "airport", 'strike',
  'drone', 'radar', 'firing', 'shot'
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