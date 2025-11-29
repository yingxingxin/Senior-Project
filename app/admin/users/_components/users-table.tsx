"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, SortableHeader, PaginationState } from "@/components/ui/data-table";
import { buildPaginationUrl } from "@/src/lib/pagination";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: Date | null;
  isEmailVerified: boolean;
  onboardingCompleted: Date | null;
  onboardingStep: string | null;
  skillLevel: string | null;
};

const columns: ColumnDef<AdminUser>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.email}
        {row.original.isEmailVerified && (
          <Badge variant="outline" className="text-xs">
            Verified
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant={row.original.role === "admin" ? "default" : "secondary"}>
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: "onboardingCompleted",
    header: "Status",
    cell: ({ row }) =>
      row.original.onboardingCompleted ? (
        <Badge variant="outline" className="bg-green-50 dark:bg-green-950">
          Completed
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950">
          {row.original.onboardingStep || "Not Started"}
        </Badge>
      ),
  },
  {
    accessorKey: "skillLevel",
    header: "Skill Level",
    cell: ({ row }) =>
      row.original.skillLevel ? (
        <Badge variant="outline">{row.original.skillLevel}</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column}>Joined</SortableHeader>,
    cell: ({ row }) =>
      row.original.createdAt
        ? new Date(row.original.createdAt).toLocaleDateString()
        : "Unknown",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Button asChild size="sm" variant="outline">
        <Link href={`/admin/users/${row.original.id}`}>View</Link>
      </Button>
    ),
  },
];

interface UsersTableProps {
  users: AdminUser[];
  pagination: PaginationState;
}

export function UsersTable({ users, pagination }: UsersTableProps) {
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
      data={users}
      pagination={pagination}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      emptyMessage="No users found"
    />
  );
}
