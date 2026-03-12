"use client";

import { Award } from "lucide-react";
import { getUserMiles } from "@/lib/mock-data";

export function Navbar() {
  const miles = getUserMiles();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            Dining Offers
          </h1>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-200">
            <Award className="h-4 w-4 text-[#6366F1]" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
              <span className="text-xs font-medium text-gray-600 leading-tight">
                Max Miles
              </span>
              <span className="text-sm font-bold text-[#6366F1] leading-tight">
                {miles.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
