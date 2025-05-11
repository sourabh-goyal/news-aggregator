'use client';

import { useEffect, useState } from 'react';
import { PrismaClient } from '@prisma/client';

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const response = await fetch('/api/keywords');
        const data = await response.json();
        setKeywords(data.keywords);
      } catch (error) {
        console.error('Error fetching keywords:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKeywords();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">All Keywords</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 