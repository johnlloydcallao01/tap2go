'use client';

// Professional Header Search Component - FoodPanda Style
// Features: Real-time suggestions, debounced search, keyboard navigation

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { MagnifyingGlassIcon, ClockIcon, FireIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface SearchSuggestion {
  text: string;
  type: 'restaurant' | 'cuisine' | 'popular' | 'intelligent' | 'learned';
  score?: number;
}

interface HeaderSearchProps {
  placeholder?: string;
  className?: string;
  isMobile?: boolean;
}

export default function HeaderSearch({
  placeholder = "Search restaurants, cuisines...",
  className = "",
  isMobile = false
}: HeaderSearchProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tap2go_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Fetch suggestions from API
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      // Show popular searches when no query
      try {
        const response = await fetch('/api/search/suggestions');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const popularSuggestions = data.data.suggestions.map((text: string) => ({
              text,
              type: 'popular' as const
            }));
            setSuggestions(popularSuggestions);
          }
        }
      } catch (error) {
        console.error('Error fetching popular searches:', error);
      }
      return;
    }

    setIsLoading(true);
    try {
      // Try learned suggestions first (with user context)
      const learnedResponse = await fetch(
        `/api/search/learn?type=suggestions&q=${encodeURIComponent(searchQuery)}${user?.id ? `&userId=${user.id}` : ''}`
      );

      let suggestions: SearchSuggestion[] = [];

      if (learnedResponse.ok) {
        const learnedData = await learnedResponse.json();
        if (learnedData.success && learnedData.data.suggestions.length > 0) {
          suggestions = learnedData.data.suggestions.map((text: string, index: number) => ({
            text,
            type: 'learned' as const,
            score: learnedData.data.suggestions.length - index
          }));
        }
      }

      // Fallback to intelligent suggestions if no learned suggestions
      if (suggestions.length === 0) {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            suggestions = data.data.suggestions.map((text: string, index: number) => ({
              text,
              type: 'intelligent' as const,
              score: data.data.suggestions.length - index
            }));
          }
        }
      }

      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Debounced search
  const debouncedFetchSuggestions = useCallback((searchQuery: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300); // 300ms delay like FoodPanda
  }, [fetchSuggestions]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.length >= 0) {
      setShowSuggestions(true);
      debouncedFetchSuggestions(value);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    setShowSuggestions(true);
    if (query.length === 0) {
      fetchSuggestions(''); // Load popular searches
    }
  };

  // Handle input blur (with delay to allow suggestion clicks)
  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  // Save search to recent searches
  const saveToRecentSearches = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('tap2go_recent_searches', JSON.stringify(updated));
  };

  // Track search event for learning
  const trackSearch = async (searchTerm: string, resultCount: number = 0) => {
    try {
      await fetch('/api/search/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track_search',
          query: searchTerm,
          results: resultCount,
          userId: user?.id,
          sessionId
        })
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  };

  // Track suggestion click for learning
  const trackSuggestionClick = async (suggestion: SearchSuggestion, position: number) => {
    try {
      await fetch('/api/search/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track_click',
          query: query,
          clickedResult: suggestion.text,
          position: position,
          userId: user?.id,
          sessionId
        })
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  // Handle search submission
  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    saveToRecentSearches(searchTerm.trim());
    trackSearch(searchTerm.trim()); // Track for learning
    setShowSuggestions(false);
    setQuery('');
    router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSearch(suggestions[selectedIndex].text);
    } else {
      handleSearch(query);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion, index: number) => {
    trackSuggestionClick(suggestion, index); // Track for learning
    handleSearch(suggestion.text);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // Get suggestion icon
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'popular':
        return <FireIcon className="h-4 w-4 text-orange-500" />;
      case 'recent':
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
      case 'intelligent':
        return <MagnifyingGlassIcon className="h-4 w-4 text-blue-500" />;
      case 'learned':
        return <SparklesIcon className="h-4 w-4 text-purple-500" />;
      default:
        return <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <MagnifyingGlassIcon className={`absolute ${isMobile ? 'left-4' : 'left-3'} top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400`} />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className={`
            w-full ${isMobile ? 'pl-12 pr-12 py-3 rounded-full' : 'pl-10 pr-10 py-2 rounded-lg'} 
            bg-white text-gray-700 placeholder-gray-500 border border-gray-300
            focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent
            transition-all duration-200
            ${showSuggestions && suggestions.length > 0 ? 'rounded-b-none border-b-0' : ''}
          `}
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className={`absolute ${isMobile ? 'right-4' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg max-h-80 overflow-y-auto z-50"
        >
          {/* Recent Searches */}
          {query.length === 0 && recentSearches.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                Recent Searches
              </div>
              {recentSearches.slice(0, 3).map((search, index) => (
                <button
                  key={`recent-${index}`}
                  onClick={() => handleSearch(search)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100"
                >
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{search}</span>
                </button>
              ))}
              {suggestions.length > 0 && (
                <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                  {query.length === 0 ? 'Popular Searches' : 'Suggestions'}
                </div>
              )}
            </>
          )}

          {/* Suggestions */}
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion, index)}
              className={`
                w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3
                ${selectedIndex === index ? 'bg-orange-50 border-l-2 border-orange-500' : ''}
                ${index === suggestions.length - 1 ? '' : 'border-b border-gray-100'}
              `}
            >
              {getSuggestionIcon(suggestion.type)}
              <span className="text-gray-700">{suggestion.text}</span>
              {suggestion.type === 'learned' && (
                <span className="ml-auto text-xs text-purple-500 font-medium">Smart</span>
              )}
            </button>
          ))}

          {/* Loading state */}
          {isLoading && (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
              <span className="ml-2">Loading suggestions...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
