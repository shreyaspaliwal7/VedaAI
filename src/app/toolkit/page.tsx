"use client";

import MobileHeader from "@/components/layout/MobileHeader";
import { Wrench } from "lucide-react";

export default function ToolkitPage() {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden min-h-full bg-gray-50">
        <MobileHeader title="AI Toolkit" />
        <div className="flex flex-col items-center justify-center h-[60vh] px-4 text-center text-gray-500 gap-3">
          <Wrench size={48} className="text-gray-300" />
          <h2 className="font-semibold text-gray-800 text-base">AI Teacher's Toolkit</h2>
          <p className="text-sm text-gray-500">Smart tools to help teachers draft syllabi, rubrics, and lessons. Coming soon!</p>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex flex-col items-center justify-center h-[70vh] text-center text-gray-500 gap-4 animate-fade-in">
        <Wrench size={64} className="text-gray-300" />
        <h1 className="text-xl font-bold text-gray-800">AI Teacher's Toolkit</h1>
        <p className="text-sm text-gray-500 max-w-sm">Advanced pedagogical tools to generate rubrics, lesson plans, syllabi, and reports. This section is currently under development.</p>
      </div>
    </>
  );
}
