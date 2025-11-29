"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, SortableHeader, PaginationState } from "@/components/ui/data-table";
import { buildPaginationUrl } from "@/src/lib/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import type { AdminLesson } from "@/src/db/queries/admin";

const columns: ColumnDef<AdminLesson>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <SortableHeader column={column}>Title</SortableHeader>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.icon && <span>{row.original.icon}</span>}
        <span className="font-medium">{row.original.title}</span>
        {row.original.isAiGenerated && (
          <Badge variant="outline" className="text-xs">
            AI
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
        {row.original.slug}
      </code>
    ),
  },
  {
    accessorKey: "difficulty",
    header: "Difficulty",
    cell: ({ row }) =>
      row.original.difficulty ? (
        <Badge
          variant="outline"
          className={
            row.original.difficulty === "beginner"
              ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
              : row.original.difficulty === "intermediate"
                ? "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300"
                : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
          }
        >
          {row.original.difficulty}
        </Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "estimatedDurationSec",
    header: "Duration",
    cell: ({ row }) => {
      const sec = row.original.estimatedDurationSec;
      if (!sec) return <span className="text-muted-foreground">—</span>;
      const min = Math.floor(sec / 60);
      return <span>{min} min</span>;
    },
  },
  {
    accessorKey: "sectionCount",
    header: "Sections",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.sectionCount}</Badge>
    ),
  },
  {
    accessorKey: "scope",
    header: "Scope",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={
          row.original.scope === "global"
            ? "bg-blue-50 dark:bg-blue-950"
            : row.original.scope === "user"
              ? "bg-purple-50 dark:bg-purple-950"
              : "bg-orange-50 dark:bg-orange-950"
        }
      >
        {row.original.scope}
      </Badge>
    ),
  },
  {
    accessorKey: "isPublished",
    header: "Status",
    cell: ({ row }) =>
      row.original.isPublished ? (
        <Badge variant="outline" className="bg-green-50 dark:bg-green-950">
          <Eye className="h-3 w-3 mr-1" />
          Published
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-muted">
          <EyeOff className="h-3 w-3 mr-1" />
          Draft
        </Badge>
      ),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => <SortableHeader column={column}>Updated</SortableHeader>,
    cell: ({ row }) =>
      row.original.updatedAt
        ? new Date(row.original.updatedAt).toLocaleDateString()
        : "Unknown",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/content/lessons/${row.original.id}`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => {
              // Delete action will be handled via server action
              if (confirm(`Delete "${row.original.title}"? This cannot be undone.`)) {
                // TODO: Implement delete action
                console.log("Delete lesson:", row.original.id);
              }
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

interface LessonsTableProps {
  lessons: AdminLesson[];
  pagination: PaginationState;
}

export function LessonsTable({ lessons, pagination }: LessonsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const url = buildPaginationUrl(pathname, searchParams, { page });
    router.push(url);
  };

  const handlePageSizeChange = (pageSize: number) => {
    const url = buildPaginationUrl(pathname, searchParams, { pageSize });
    router.push(url);
  };

  return (
    <DataTable
      columns={columns}
      data={lessons}
      pagination={pagination}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      emptyMessage="No lessons found"
    />
  );
}
