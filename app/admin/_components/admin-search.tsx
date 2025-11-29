"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, User, BookOpen, Brain, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchResult {
  users: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
  }>;
  lessons: Array<{
    id: number;
    title: string | null;
    slug: string;
    difficulty: string | null;
  }>;
  quizzes: Array<{
    id: number;
    title: string | null;
    slug: string;
    topicSlug: string | null;
    skillLevel: string | null;
  }>;
}

export function AdminSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/admin/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Build flat list of all results for keyboard navigation
  const allResults = results
    ? [
        ...results.users.map((u) => ({ type: "user" as const, ...u })),
        ...results.lessons.map((l) => ({ type: "lesson" as const, ...l })),
        ...results.quizzes.map((q) => ({ type: "quiz" as const, ...q })),
      ]
    : [];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || allResults.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, allResults.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0) {
            const item = allResults[selectedIndex];
            navigateToResult(item);
          }
          break;
        case "Escape":
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, allResults, selectedIndex]
  );

  const navigateToResult = (item: (typeof allResults)[number]) => {
    setIsOpen(false);
    setQuery("");
    switch (item.type) {
      case "user":
        router.push(`/admin/users/${item.id}`);
        break;
      case "lesson":
        // Content pages coming soon - just go to users for now
        router.push(`/admin/users`);
        break;
      case "quiz":
        // Content pages coming soon - just go to users for now
        router.push(`/admin/users`);
        break;
    }
  };

  const hasResults = results && (results.users.length > 0 || results.lessons.length > 0 || results.quizzes.length > 0);
  const noResults = results && !hasResults && query.length >= 2;

  let currentIndex = -1;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search users, lessons, quizzes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-9"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && (hasResults || noResults) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-lg">
          {noResults && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {hasResults && (
            <div className="max-h-80 overflow-y-auto p-2">
              {results.users.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                    Users
                  </div>
                  {results.users.map((user) => {
                    currentIndex++;
                    const index = currentIndex;
                    return (
                      <button
                        key={`user-${user.id}`}
                        onClick={() => navigateToResult({ type: "user", ...user })}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-accent",
                          selectedIndex === index && "bg-accent"
                        )}
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium">{user.name}</div>
                          <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {results.lessons.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                    Lessons
                  </div>
                  {results.lessons.map((lesson) => {
                    currentIndex++;
                    const index = currentIndex;
                    return (
                      <button
                        key={`lesson-${lesson.id}`}
                        onClick={() => navigateToResult({ type: "lesson", ...lesson })}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-accent opacity-60",
                          selectedIndex === index && "bg-accent"
                        )}
                      >
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium">{lesson.title || lesson.slug}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {lesson.difficulty || "—"} • Content pages coming soon
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {results.quizzes.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                    Quizzes
                  </div>
                  {results.quizzes.map((quiz) => {
                    currentIndex++;
                    const index = currentIndex;
                    return (
                      <button
                        key={`quiz-${quiz.id}`}
                        onClick={() => navigateToResult({ type: "quiz", ...quiz })}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-accent opacity-60",
                          selectedIndex === index && "bg-accent"
                        )}
                      >
                        <Brain className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium">{quiz.title || quiz.slug}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {quiz.topicSlug || "—"} • Content pages coming soon
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
