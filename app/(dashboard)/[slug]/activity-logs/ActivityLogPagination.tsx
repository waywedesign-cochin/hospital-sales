"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ActivityLogPaginationProps {
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export default function ActivityLogPagination({ totalPages, currentPage, totalCount }: ActivityLogPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between text-sm text-slate-500">
      <div>
        Showing <span className="font-medium text-slate-800">{totalCount}</span> total results
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg border-slate-200"
          disabled={currentPage <= 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <span className="px-2 font-medium">
          {currentPage} / {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg border-slate-200"
          disabled={currentPage >= totalPages || totalPages === 0}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
