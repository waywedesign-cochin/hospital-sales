"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ActivityLogSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get("search") || "");

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
      
      if (search !== (searchParams.get("search") || "")) {
        // Reset to page 1 on new search only
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, pathname, router, searchParams]);

  return (
    <div className="relative max-w-sm w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <Input
        placeholder="Search by action, resource, details or user..."
        className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-100 rounded-xl"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}
