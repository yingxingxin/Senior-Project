"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";
import { useCallback, useState, useTransition } from "react";

interface UsersFiltersProps {
  search?: string;
  role?: string;
  onboardingStatus?: string;
  createdAfter?: string;
}

export function UsersFilters({
  search,
  role,
  onboardingStatus,
  createdAfter,
}: UsersFiltersProps) {
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
      role: null,
      onboarding: null,
      created_gte: null,
    });
  };

  const hasActiveFilters = search || role || onboardingStatus || createdAfter;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Searching..." : "Search"}
        </Button>
      </form>

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
          {role && (
            <Badge variant="secondary" className="gap-1">
              Role: {role}
              <button
                onClick={() => clearFilter("role")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {onboardingStatus && (
            <Badge variant="secondary" className="gap-1">
              Onboarding: {onboardingStatus}
              <button
                onClick={() => clearFilter("onboarding")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {createdAfter && (
            <Badge variant="secondary" className="gap-1">
              Created after: {new Date(createdAfter).toLocaleDateString()}
              <button
                onClick={() => clearFilter("created_gte")}
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
