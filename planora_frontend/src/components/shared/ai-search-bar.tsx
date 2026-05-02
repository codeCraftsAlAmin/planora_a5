"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Sparkles, Loader2, X } from "lucide-react";
import { aiSearchService } from "@/lib/api-service";
import { cn } from "@/lib/utils";

interface AISearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

export function AISearchBar({ onSearch, initialValue = "" }: AISearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const res = await aiSearchService.getSuggestions(query);
          if (res.ok && res.data) {
            setSuggestions(res.data);
            setIsOpen(true);
          }
        } catch (err) {
          console.error("Failed to fetch suggestions", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        handleSelect(suggestions[activeIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (suggestion: string) => {
    setQuery(suggestion);
    setIsOpen(false);
    onSearch(suggestion);
  };

  const handleSearch = () => {
    setIsOpen(false);
    onSearch(query);
  };

  const clearQuery = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    onSearch("");
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="group relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[var(--color-brand-600)]">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Ask AI to find events (e.g. 'free concerts')"
          className="h-14 w-full rounded-2xl border-2 border-[var(--color-border)] bg-white/80 backdrop-blur-md pl-12 pr-12 text-base font-medium text-[var(--color-copy)] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] outline-none transition-all focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[var(--color-brand-100)] group-hover:border-[var(--color-brand-300)]"
        />
        <div className="absolute inset-y-0 right-4 flex items-center space-x-2">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-[var(--color-copy-muted)]" />
          ) : query ? (
            <button
              onClick={clearQuery}
              className="rounded-full p-1 transition hover:bg-gray-100 text-[var(--color-copy-muted)]"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
          <button
            onClick={handleSearch}
            className="rounded-xl bg-[var(--color-brand-600)] p-2 text-white transition hover:bg-[var(--color-brand-700)] shadow-lg shadow-[var(--color-brand-200)] active:scale-95"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-3 w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white/95 py-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-700)] opacity-70">
            Smart Suggestions
          </div>
          {suggestions.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSelect(item)}
              className={cn(
                "flex w-full items-center px-4 py-3 text-left text-sm transition-all",
                index === activeIndex
                  ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)] pl-6"
                  : "hover:bg-gray-50 text-[var(--color-copy)] hover:pl-6"
              )}
            >
              <Search className="mr-3 h-4 w-4 opacity-30" />
              <span className="font-medium">{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
