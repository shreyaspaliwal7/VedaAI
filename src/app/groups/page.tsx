"use client";

import MobileHeader from "@/components/layout/MobileHeader";
import { Users } from "lucide-react";

export default function GroupsPage() {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden min-h-full bg-gray-50">
        <MobileHeader title="My Groups" />
        <div className="flex flex-col items-center justify-center h-[60vh] px-4 text-center text-gray-500 gap-3">
          <Users size={48} className="text-gray-300" />
          <h2 className="font-semibold text-gray-800 text-base">My Groups</h2>
          <p className="text-sm text-gray-500">Organize and manage your classes, student groups, and departments. Coming soon!</p>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex flex-col items-center justify-center h-[70vh] text-center text-gray-500 gap-4 animate-fade-in">
        <Users size={64} className="text-gray-300" />
        <h1 className="text-xl font-bold text-gray-800">My Groups</h1>
        <p className="text-sm text-gray-500 max-w-sm">Manage student cohorts, classes, departments, and study circles. This section is currently under development.</p>
      </div>
    </>
  );
}
