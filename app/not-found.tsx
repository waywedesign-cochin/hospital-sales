"use client";
import Link from "next/link";
import { FileQuestion, MoveLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="h-[calc(100vh-4rem)] w-full flex flex-col items-center justify-center bg-green-100 p-6">
      <div className="text-center max-w-md mx-auto space-y-6">
        {/* Icon Container with glowing effect */}
        <div className="relative flex items-center justify-center w-24 h-24 mx-auto">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
          <div className="relative w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center ring-1 ring-blue-100 shadow-sm">
            <FileQuestion className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            We couldn&apos;t locate page you are looking for. It might have been
            moved or archived.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <MoveLeft className="w-4 h-4" />
            Go Back
          </button>

          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Decorative Error Code */}
      <div className="absolute bottom-8 text-xs font-mono text-gray-300">
        ERROR_CODE: 404_RESOURCE_MISSING
      </div>
    </div>
  );
}
