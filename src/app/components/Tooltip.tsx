'use client';

import { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap">
          {content}
          <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
        </div>
      )}
    </div>
  );
} 