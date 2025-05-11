'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkerInitializerClient() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [nextUpdateIn, setNextUpdateIn] = useState<string>('');
  const [newArticlesAvailable, setNewArticlesAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Function to update the countdown timer
  const updateCountdown = (secondsLeft: number) => {
    if (secondsLeft <= 0) {
      setNextUpdateIn('checking...');
      return;
    }
    setNextUpdateIn(`${secondsLeft} seconds`);
  };

  // Function to start countdown
  const startCountdown = (seconds: number) => {
    // Clear any existing countdown
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    let timeLeft = seconds;
    updateCountdown(timeLeft);
    
    countdownRef.current = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        initializeWorker(); // Fetch new data when countdown reaches 0
      } else {
        updateCountdown(timeLeft);
      }
    }, 1000);
  };

  // Function to ping the server to trigger worker initialization
  const initializeWorker = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/worker/initialize', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.skipped) {
        console.log('⏳ Worker already running:', data.message);
        // Start countdown from the nextFetchIn value
        const secondsLeft = parseInt(data.nextFetchIn);
        if (!isNaN(secondsLeft)) {
          startCountdown(secondsLeft);
        }
      } else {
        console.log('✅ Worker initialization response:', data);
        setLastUpdate(new Date());
        // Start countdown from 60 seconds
        startCountdown(300);
        
        // If new articles were fetched, show notification
        if (data.newArticlesCount > 0) {
          setNewArticlesAvailable(true);
        }
      }
    } catch (error) {
      console.error('❌ Error initializing worker:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Client-side worker initialization started');
    
    // Initialize worker on component mount
    initializeWorker();

    // Set up periodic worker checks
    const interval = setInterval(() => {
      initializeWorker();
    }, 5 * 60 * 1000); // 60 seconds

    return () => {
      clearInterval(interval);
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const handleRefresh = () => {
    setNewArticlesAvailable(false);
    router.refresh();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Loading Banner */}
      {isLoading && (
        <div className="bg-blue-500 text-white px-4 py-2 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          <span>Checking for new articles...</span>
        </div>
      )}

      {/* New Articles Badge */}
      {newArticlesAvailable && !isLoading && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <button 
            onClick={handleRefresh}
            className="group relative bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg hover:bg-gray-700 transition-all duration-300 flex items-center gap-2"
          >
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span className="font-medium">New Articles</span>
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              ✨
            </span>
          </button>
        </div>
      )}

      {/* Next Update Info */}
      {!isLoading && !newArticlesAvailable && nextUpdateIn && (
        <div className="bg-gray-100 text-gray-600 px-4 py-1 text-sm flex items-center justify-center">
          <span>Next update in {nextUpdateIn}</span>
        </div>
      )}
    </div>
  );
} 