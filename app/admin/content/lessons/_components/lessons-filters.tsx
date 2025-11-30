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

interface LessonsFiltersProps {
  search?: string;
  difficulty?: string;
  scope?: string;
  isPublished?: boolean;
}

export function LessonsFilters({
  search,
  difficulty,
  scope,
  isPublished,
}: LessonsFiltersProps) {
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
      difficulty: null,
      scope: null,
      published: null,
    });
  };

  const hasActiveFilters = search || difficulty || scope || isPublished !== undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search lessons..."
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
          value={difficulty ?? "all"}
          onValueChange={(value) =>
            updateParams({ difficulty: value === "all" ? null : value })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={scope ?? "all"}
          onValueChange={(value) =>
            updateParams({ scope: value === "all" ? null : value })
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Scope" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scopes</SelectItem>
            <SelectItem value="global">Global</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="shared">Shared</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={isPublished === undefined ? "all" : isPublished ? "true" : "false"}
          onValueChange={(value) =>
            updateParams({ published: value === "all" ? null : value })
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Published</SelectItem>
            <SelectItem value="false">Draft</SelectItem>
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
          {difficulty && (
            <Badge variant="secondary" className="gap-1">
              Difficulty: {difficulty}
              <button
                onClick={() => clearFilter("difficulty")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {scope && (
            <Badge variant="secondary" className="gap-1">
              Scope: {scope}
              <button
                onClick={() => clearFilter("scope")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {isPublished !== undefined && (
            <Badge variant="secondary" className="gap-1">
              Status: {isPublished ? "Published" : "Draft"}
              <button
                onClick={() => clearFilter("published")}
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
