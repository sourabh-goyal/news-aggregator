'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { FiRefreshCw, FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import { Article } from '@/types/news';

const ITEMS_PER_PAGE = 24;

const FEEDBACK_TYPES = [
  { value: 'add_keyword', label: 'Suggest keyword(s) to add' },
  { value: 'remove_keyword', label: 'Suggest keyword(s) to remove' },
  { value: 'bug', label: 'Report a bug' },
  { value: 'general', label: 'General feedback' },
];

export default function ClientHome() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [keywordSearchQuery, setKeywordSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['popular']);
  const [hasMounted, setHasMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState(FEEDBACK_TYPES[0].value);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<'idle'|'success'|'error'>('idle');
  const [feedbackError, setFeedbackError] = useState('');
  const feedbackMsgRef = useRef<HTMLTextAreaElement>(null);
  const [hasNewArticles, setHasNewArticles] = useState(false);
  const [lastArticleId, setLastArticleId] = useState<string | null>(null);
  const [newArticlesCount, setNewArticlesCount] = useState(0);
  const [allKeywords, setAllKeywords] = useState<Array<{ keyword: string; count: number }>>([]);

  // Categorize keywords
  const categorizedKeywords = useMemo(() => {
    const categories: { [key: string]: Array<{ keyword: string; count: number }> } = {
      popular: [], // Top 10 most used keywords
      location: [], // Location-related keywords
      military: [], // Military-related keywords
      political: [], // Political-related keywords
      other: [] // Everything else
    };

    const locationKeywords = ['india', 'pakistan', 'kashmir', 'loc', 'border', 'region', 'area', 'state', 'province'];
    const militaryKeywords = ['military', 'army', 'soldier', 'troop', 'force', 'operation', 'attack', 'defense', 'war', 'conflict'];
    const politicalKeywords = ['government', 'minister', 'official', 'diplomat', 'treaty', 'agreement', 'talks', 'meeting', 'summit'];

    allKeywords.forEach(({ keyword, count }) => {
      const lowerKeyword = keyword.toLowerCase();
      
      if (locationKeywords.some(k => lowerKeyword.includes(k))) {
        categories.location.push({ keyword, count });
      } else if (militaryKeywords.some(k => lowerKeyword.includes(k))) {
        categories.military.push({ keyword, count });
      } else if (politicalKeywords.some(k => lowerKeyword.includes(k))) {
        categories.political.push({ keyword, count });
      } else {
        categories.other.push({ keyword, count });
      }
    });

    // Sort each category by count
    Object.keys(categories).forEach(category => {
      categories[category].sort((a, b) => b.count - a.count);
    });

    // Move top 10 keywords to popular category
    const allSorted = [...allKeywords].sort((a, b) => b.count - a.count);
    categories.popular = allSorted.slice(0, 10);

    return categories;
  }, [allKeywords]);

  // Filter keywords based on search
  const filteredCategories = useMemo(() => {
    if (!keywordSearchQuery) return categorizedKeywords;

    const query = keywordSearchQuery.toLowerCase();
    const filtered: { [key: string]: Array<{ keyword: string; count: number }> } = {};

    Object.entries(categorizedKeywords).forEach(([category, keywords]) => {
      const filteredKeywords = keywords.filter(({ keyword }) => 
        keyword.toLowerCase().includes(query)
      );
      if (filteredKeywords.length > 0) {
        filtered[category] = filteredKeywords;
      }
    });

    return filtered;
  }, [categorizedKeywords, keywordSearchQuery]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Fetch all keywords
  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const response = await fetch('/api/keywords');
        const data = await response.json();
        setAllKeywords(data.keywords);
      } catch (error) {
        console.error('Error fetching keywords:', error);
      }
    };
    fetchKeywords();
  }, []);

  // Update URL when page, keywords, or search changes
  useEffect(() => {
    if (hasMounted) {
      const url = new URL(window.location.href);
      url.searchParams.set('page', currentPage.toString());
      if (selectedKeywords.length > 0) {
        url.searchParams.set('keywords', selectedKeywords.join(','));
      } else {
        url.searchParams.delete('keywords');
      }
      if (searchQuery) {
        url.searchParams.set('search', searchQuery);
      } else {
        url.searchParams.delete('search');
      }
      window.history.pushState({}, '', url.toString());
    }
  }, [currentPage, selectedKeywords, searchQuery, hasMounted]);

  // Initialize page, keywords, and search from URL on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const pageParam = url.searchParams.get('page');
    const keywordsParam = url.searchParams.get('keywords');
    const searchParam = url.searchParams.get('search');
    
    if (pageParam) {
      const page = parseInt(pageParam);
      if (!isNaN(page) && page > 0) {
        setCurrentPage(page);
      }
    }
    
    if (keywordsParam) {
      setSelectedKeywords(keywordsParam.split(','));
    }

    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  const fetchNews = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: ITEMS_PER_PAGE.toString(),
      });
      
      if (selectedKeywords.length > 0) {
        params.append('keywords', selectedKeywords.join(','));
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await fetch(`/api/news?${params.toString()}`);
      const data = await response.json();
      
      // Check for new articles
      if (page === 1 && lastArticleId && data.articles.length > 0) {
        const newestArticleId = data.articles[0].id;
        if (newestArticleId !== lastArticleId) {
          // Count how many new articles we have
          const newArticles = data.articles.findIndex((article: Article) => article.id === lastArticleId);
          setNewArticlesCount(newArticles === -1 ? data.articles.length : newArticles);
          setHasNewArticles(true);
        }
      }
      
      setArticles(data.articles);
      setTotalArticles(data.total);
      setLastUpdate(new Date());
      if (page === 1) {
        setLastArticleId(data.articles[0]?.id || null);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(currentPage);
    // Refresh data every 30 seconds
    const interval = setInterval(() => fetchNews(currentPage), 30000);
    return () => clearInterval(interval);
  }, [currentPage, selectedKeywords, searchQuery]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const totalPages = Math.ceil(totalArticles / ITEMS_PER_PAGE);

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords(prev =>
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackStatus('idle');
    setFeedbackError('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: feedbackType, message: feedbackMsg })
      });
      if (res.ok) {
        setFeedbackStatus('success');
        setFeedbackMsg('');
        setFeedbackType(FEEDBACK_TYPES[0].value);
        if (feedbackMsgRef.current) feedbackMsgRef.current.value = '';
      } else {
        const data = await res.json();
        setFeedbackStatus('error');
        setFeedbackError(data.error || 'Failed to submit feedback');
      }
    } catch (err) {
      setFeedbackStatus('error');
      setFeedbackError('Failed to submit feedback');
    }
  };

  const handleRefresh = () => {
    setHasNewArticles(false);
    setNewArticlesCount(0);
    fetchNews(1);
  };

  // Remove the filteredArticles useMemo since filtering is now done on the server
  const filteredArticles = articles;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/indian-flag.png" alt="Indian Flag" className="w-8 h-8 sm:w-10 sm:h-10 rounded shadow" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">India Pakistan Conflict News Aggregator</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            {hasMounted && (
              <>
                <span className="text-xs sm:text-sm text-gray-500">
                  Last updated: {format(lastUpdate, 'MMM d, yyyy HH:mm:ss')}
                </span>
                {hasNewArticles && (
                  <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm hover:bg-blue-600 transition-colors"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    {newArticlesCount} new article{newArticlesCount !== 1 ? 's' : ''} available
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search articles..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Keywords Filter */}
        <div className="mb-6 sm:mb-8 bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg font-semibold">Filter by Keywords</h2>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search keywords..."
                value={keywordSearchQuery}
                onChange={(e) => setKeywordSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 pl-8 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(filteredCategories).map(([category, keywords]) => (
              <div key={category} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 flex justify-between items-center text-left"
                >
                  <span className="font-medium capitalize">{category}</span>
                  <span className="text-gray-500 text-sm">
                    {expandedCategories.includes(category) ? '▼' : '▶'}
                  </span>
                </button>
                
                {expandedCategories.includes(category) && (
                  <div className="p-3 flex flex-wrap gap-2">
                    {keywords.map(({ keyword, count }) => (
                      <button
                        key={keyword}
                        onClick={() => handleKeywordToggle(keyword)}
                        className={`px-2 py-1 rounded-full text-xs sm:text-sm transition-colors ${
                          selectedKeywords.includes(keyword)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {keyword} ({count})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedKeywords.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Selected Keywords:</span>
                <button
                  onClick={() => setSelectedKeywords([])}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedKeywords.map(keyword => (
                  <button
                    key={keyword}
                    onClick={() => handleKeywordToggle(keyword)}
                    className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs sm:text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                  >
                    {keyword}
                    <span className="text-xs">×</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Articles Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-4 sm:p-6">
                {article.imageUrl && (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                    style={{ maxHeight: 192 }}
                    loading="lazy"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium text-blue-600">
                    {article.source}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {format(new Date(article.pubDate), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:text-blue-600"
                  >
                    {article.title}
                  </a>
                </h2>
                {article.description && (
                  <p className="text-gray-600 line-clamp-3 text-xs sm:text-base">
                    {article.description}
                  </p>
                )}
                {((selectedKeywords.length > 0) || searchQuery) && (
                  <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                    {article.keywords.filter(keyword => {
                      const matchesKeyword = selectedKeywords.includes(keyword);
                      const matchesSearch = searchQuery && (
                        article.title.toLowerCase().includes(keyword.toLowerCase()) ||
                        (article.description?.toLowerCase().includes(keyword.toLowerCase()) ?? false)
                      );
                      return matchesKeyword || matchesSearch;
                    }).map((keyword) => (
                      <span
                        key={keyword}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs sm:text-sm rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="inline-block" />
            </button>
            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronRight className="inline-block" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 