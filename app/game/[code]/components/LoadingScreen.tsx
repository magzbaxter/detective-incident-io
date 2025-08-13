'use client';

import { Search } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-detective-cream flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <Search 
            size={64} 
            className="text-detective-brown animate-pulse mx-auto" 
          />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-detective-gold rounded-full animate-bounce" />
        </div>
        
        <h2 className="text-2xl font-bold text-detective-dark mb-4 font-detective">
          {message}
        </h2>
        
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-detective-brown rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-detective-brown rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-detective-brown rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}