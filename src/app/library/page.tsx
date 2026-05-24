"use client";

import MobileHeader from "@/components/layout/MobileHeader";
import { Library } from "lucide-react";

export default function LibraryPage() {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden min-h-full bg-gray-50">
        <MobileHeader title="My Library" />
        <div className="flex flex-col items-center justify-center h-[60vh] px-4 text-center text-gray-500 gap-3">
          <Library size={48} className="text-gray-300" />
          <h2 className="font-semibold text-gray-800 text-base">My Library</h2>
          <p className="text-sm text-gray-500">Your saved assessments and templates will appear here. Coming soon!</p>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex flex-col items-center justify-center h-[70vh] text-center text-gray-500 gap-4 animate-fade-in">
        <Library size={64} className="text-gray-300" />
        <h1 className="text-xl font-bold text-gray-800">My Library</h1>
        <p className="text-sm text-gray-500 max-w-sm">Your saved assessments, templates, and learning resources will appear here. This section is currently under development.</p>
      </div>
    </>
  );
}
