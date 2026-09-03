"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  current?: boolean;
  icon?: React.ReactNode;
};

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb = ({ items, className = "" }: BreadcrumbProps) => {
  const params = useParams();
  const slug = params?.slug as string;
  const baseUrl = slug ? `/${slug}` : "";

  return (
    <nav
      className={`inline-flex items-center text-xs md:text-sm font-medium ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, index) => {
          let finalHref = item.href || "#";
          // If the href is absolute and doesn't already start with the baseUrl, prepend it
          if (finalHref.startsWith("/") && baseUrl && !finalHref.startsWith(baseUrl)) {
            finalHref = `${baseUrl}${finalHref}`;
          }

          const isDashboard =
            item.label.toLowerCase() === "dashboard" ||
            item.label.toLowerCase() === "home";

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-1.5 leading-none"
            >
              {index > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 text-slate-400 shrink-0"
                  aria-hidden="true"
                />
              )}

              {item.current ? (
                <span
                  aria-current="page"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/90 text-[#00236F] font-semibold border border-blue-100 shadow-2xs transition-all duration-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] shadow-[0_0_6px_rgba(45,212,191,0.7)]" />
                  <span>{item.label}</span>
                </span>
              ) : (
                <Link
                  href={finalHref}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-500 hover:text-[#00236F] hover:bg-slate-100/90 font-medium transition-all duration-150 group"
                >
                  {item.icon ? (
                    item.icon
                  ) : isDashboard ? (
                    <Home className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00236F] transition-colors" />
                  ) : null}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

