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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { AdminQuiz } from "@/src/db/queries/admin";

const columns: ColumnDef<AdminQuiz>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <SortableHeader column={column}>Title</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-medium">{row.original.title}</span>
    ),
  },
  {
    accessorKey: "topicSlug",
    header: "Topic",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.topicSlug}</Badge>
    ),
  },
  {
    accessorKey: "skillLevel",
    header: "Skill Level",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={
          row.original.skillLevel === "beginner"
            ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
            : row.original.skillLevel === "intermediate"
              ? "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300"
              : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
        }
      >
        {row.original.skillLevel}
      </Badge>
    ),
  },
  {
    accessorKey: "questionCount",
    header: "Questions",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.questionCount}</Badge>
    ),
  },
  {
    accessorKey: "defaultLength",
    header: "Default Length",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.defaultLength}</span>
    ),
  },
  {
    accessorKey: "attemptCount",
    header: "Attempts",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.attemptCount}</span>
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
            <Link href={`/admin/content/quizzes/${row.original.id}`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => {
              if (confirm(`Delete "${row.original.title}"? This cannot be undone.`)) {
                // TODO: Implement delete action
                console.log("Delete quiz:", row.original.id);
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

interface QuizzesTableProps {
  quizzes: AdminQuiz[];
  pagination: PaginationState;
}

export function QuizzesTable({ quizzes, pagination }: QuizzesTableProps) {
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
      data={quizzes}
      pagination={pagination}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      emptyMessage="No quizzes found"
    />
  );
}
