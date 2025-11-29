"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Search } from "lucide-react";
import { useCallback, useState, useTransition } from "react";

interface QuizzesFiltersProps {
  search?: string;
  skillLevel?: string;
  topicSlug?: string;
}

export function QuizzesFilters({
  search,
  skillLevel,
  topicSlug,
}: QuizzesFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(search ?? "");

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 when filters change
      params.set("page", "1");

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchValue || null });
  };

  const clearFilter = (key: string) => {
    if (key === "search") {
      setSearchValue("");
    }
    updateParams({ [key]: null });
  };

  const clearAllFilters = () => {
    setSearchValue("");
    updateParams({
      search: null,
      skillLevel: null,
      topic: null,
    });
  };

  const hasActiveFilters = search || skillLevel || topicSlug;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "..." : "Search"}
          </Button>
        </form>

        <Select
          value={skillLevel ?? "all"}
          onValueChange={(value) =>
            updateParams({ skillLevel: value === "all" ? null : value })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Skill Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {search && (
            <Badge variant="secondary" className="gap-1">
              Search: {search}
              <button
                onClick={() => clearFilter("search")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {skillLevel && (
            <Badge variant="secondary" className="gap-1">
              Skill Level: {skillLevel}
              <button
                onClick={() => clearFilter("skillLevel")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {topicSlug && (
            <Badge variant="secondary" className="gap-1">
              Topic: {topicSlug}
              <button
                onClick={() => clearFilter("topic")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
