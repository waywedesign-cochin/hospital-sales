"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type BreadcrumbItem = {
  label: string;
  href?: string;
  current?: boolean;
};

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  const params = useParams();
  const slug = params?.slug as string;
  const baseUrl = slug ? `/${slug}` : "";

  return (
    <nav
      className="flex items-center text-sm leading-none"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2">
        {items.map((item, index) => {
          let finalHref = item.href || "#";
          // If the href is absolute and doesn't already start with the baseUrl, prepend it
          if (finalHref.startsWith("/") && baseUrl && !finalHref.startsWith(baseUrl)) {
             finalHref = `${baseUrl}${finalHref}`;
          }

          return (
            <li key={item.label} className="flex items-center leading-none">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1 shrink-0" />
              )}

              {item.current ? (
                <span className="text-gray-700 font-semibold leading-none">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={finalHref}
                  className="text-gray-500 hover:text-green-600 font-medium leading-none"
                >
                  {item.label}
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
