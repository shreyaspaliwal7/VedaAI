"use client";

import { useState } from "react";
import Link from "next/link";
import { Filter, Search, Sparkles, X } from "lucide-react";
import { useAssignmentStore } from "@/store/assignmentStore";
import AssignmentCard from "@/components/assignments/AssignmentCard";
import EmptyAssignments from "@/components/assignments/EmptyAssignments";
import MobileHeader from "@/components/layout/MobileHeader";

export default function AssignmentsPage() {
  const { assignments } = useAssignmentStore();
  const [search, setSearch] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Filter States (Subject dropdown removed per user instruction)
  const [selectedDeadline, setSelectedDeadline] = useState<string>("all"); // "all", "today", "week", "overdue"
  const [uploadedFrom, setUploadedFrom] = useState<string>("");
  const [uploadedTo, setUploadedTo] = useState<string>("");

  // Helper date parsers
  const parseAssignedDate = (dStr: string): Date | null => {
    const parts = dStr.split("-").map(Number);
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]); // DD-MM-YYYY
    }
    return null;
  };

  const parseDueDate = (dStr: string): Date | null => {
    const parts = dStr.split("-").map(Number);
    if (parts.length === 3) {
      if (parts[0] > 1000) {
        return new Date(parts[0], parts[1] - 1, parts[2]); // YYYY-MM-DD
      } else {
        return new Date(parts[2], parts[1] - 1, parts[0]); // DD-MM-YYYY
      }
    }
    const d = new Date(dStr);
    return isNaN(d.getTime()) ? null : d;
  };

  // Filter Application
  const filtered = assignments.filter((a) => {
    // 1. Search text filter (matches assignment Title OR Subject)
    const searchLower = search.toLowerCase();
    const matchesSearch =
      a.title.toLowerCase().includes(searchLower) ||
      (a.subject && a.subject.toLowerCase().includes(searchLower));
    
    if (!matchesSearch) return false;

    // 2. Due Date / Deadline status filter
    if (selectedDeadline !== "all") {
      if (!a.dueDate) return false;
      const due = parseDueDate(a.dueDate);
      if (due) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);

        if (selectedDeadline === "today" && due.getTime() !== today.getTime()) {
          return false;
        }
        if (selectedDeadline === "overdue" && due.getTime() >= today.getTime()) {
          return false;
        }
        if (selectedDeadline === "week") {
          const nextWeek = new Date();
          nextWeek.setDate(today.getDate() + 7);
          nextWeek.setHours(23, 59, 59, 999);
          if (due.getTime() < today.getTime() || due.getTime() > nextWeek.getTime()) {
            return false;
          }
        }
      } else {
        return false;
      }
    }

    // 3. Assigned / Uploaded Date Range Filter
    if (a.assignedOn) {
      const assigned = parseAssignedDate(a.assignedOn);
      if (assigned) {
        assigned.setHours(0, 0, 0, 0);

        if (uploadedFrom) {
          const from = new Date(uploadedFrom);
          from.setHours(0, 0, 0, 0);
          if (assigned.getTime() < from.getTime()) return false;
        }

        if (uploadedTo) {
          const to = new Date(uploadedTo);
          to.setHours(23, 59, 59, 999);
          if (assigned.getTime() > to.getTime()) return false;
        }
      }
    }

    return true;
  });

  const hasActiveFilters =
    selectedDeadline !== "all" ||
    Boolean(uploadedFrom) ||
    Boolean(uploadedTo);

  const activeFiltersCount =
    (selectedDeadline !== "all" ? 1 : 0) +
    (uploadedFrom ? 1 : 0) +
    (uploadedTo ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedDeadline("all");
    setUploadedFrom("");
    setUploadedTo("");
  };

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden min-h-full bg-gray-50">
        <MobileHeader title="Assignments" />
        <div className="px-4 pt-4">
          {/* Filter + Search row */}
          <div className="flex items-center gap-2 mb-4">
            {/* Mobile Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 bg-white rounded-lg px-3 py-2 transition-colors active:bg-gray-100"
              >
                <Filter size={14} className={hasActiveFilters ? "text-[#E8521A]" : "text-gray-500"} />
                <span className="font-semibold text-xs">
                  {hasActiveFilters ? `Filters (${activeFiltersCount})` : "Filters"}
                </span>
              </button>

              {showFilterDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
                  <div className="absolute left-0 mt-1.5 w-64 bg-white border border-gray-100 rounded-xl shadow-xl z-20 p-3.5 animate-fade-in text-gray-700">
                    <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-2">
                      <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Filters</h4>
                      <button onClick={() => setShowFilterDropdown(false)}>
                        <X size={14} className="text-gray-400 hover:text-gray-600" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Deadline */}
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Deadline</label>
                        <select
                          value={selectedDeadline}
                          onChange={(e) => setSelectedDeadline(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg p-1.5 text-xs text-gray-800 bg-white outline-none"
                        >
                          <option value="all">All Deadlines</option>
                          <option value="today">Due Today</option>
                          <option value="week">Due This Week</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </div>

                      {/* Upload Range */}
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Uploaded Date</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={uploadedFrom}
                            onChange={(e) => setUploadedFrom(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg p-1.5 text-[9px]"
                          />
                          <input
                            type="date"
                            value={uploadedTo}
                            onChange={(e) => setUploadedTo(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg p-1.5 text-[9px]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-gray-100 flex justify-between">
                      <button
                        onClick={handleResetFilters}
                        className="text-[10px] font-bold text-gray-400 hover:text-[#E8521A] transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setShowFilterDropdown(false)}
                        className="bg-[#1A1A1A] text-white rounded-full px-4 py-1 text-[10px] font-bold"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Name or Subject"
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 bg-white rounded-lg outline-none focus:border-gray-400"
              />
            </div>
          </div>

          {/* Mobile Create Assignment Button */}
          <Link
            href="/assignments/create"
            className="flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-gray-800 text-white rounded-2xl py-3 px-4 text-sm font-semibold transition-colors mb-4 shadow-sm"
          >
            <Sparkles size={16} />
            <span>Create Assignment</span>
          </Link>

          {filtered.length === 0 ? (
            <EmptyAssignments />
          ) : (
            <div className="space-y-3 pb-6">
              {filtered.map((a) => (
                <AssignmentCard key={a.id} assignment={a} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block animate-fade-in">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
            <h1 className="text-xl font-bold text-gray-900">Assignments</h1>
          </div>
          <p className="text-sm text-gray-500 ml-4">
            Manage and create assignments for your classes.
          </p>
        </div>

        {/* Filter + Search row */}
        <div className="flex items-center gap-3 mb-5">
          {/* Desktop Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-1.5 text-sm text-gray-700 border border-gray-200 bg-white rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
            >
              <Filter size={14} className={hasActiveFilters ? "text-[#E8521A]" : "text-gray-500"} />
              <span>
                {hasActiveFilters ? `Filters (${activeFiltersCount})` : "Filter by"}
              </span>
            </button>

            {showFilterDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
                <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 p-4 animate-fade-in text-gray-700">
                  <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-2">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Filter Papers</h4>
                    <button onClick={() => setShowFilterDropdown(false)}>
                      <X size={14} className="text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {/* Deadline Status */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Deadline Status</label>
                      <select
                        value={selectedDeadline}
                        onChange={(e) => setSelectedDeadline(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#E8521A] transition-colors text-gray-800 bg-white"
                      >
                        <option value="all">All Deadlines</option>
                        <option value="today">Due Today</option>
                        <option value="week">Due This Week</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>

                    {/* Uploaded Date Range */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Uploaded Date Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="block text-[9px] text-gray-400 mb-0.5">From</span>
                          <input
                            type="date"
                            value={uploadedFrom}
                            onChange={(e) => setUploadedFrom(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg p-1.5 text-[10px] outline-none focus:border-[#E8521A] transition-colors text-gray-800"
                          />
                        </div>
                        <div>
                          <span className="block text-[9px] text-gray-400 mb-0.5">To</span>
                          <input
                            type="date"
                            value={uploadedTo}
                            onChange={(e) => setUploadedTo(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg p-1.5 text-[10px] outline-none focus:border-[#E8521A] transition-colors text-gray-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Controls */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={handleResetFilters}
                      className="text-[10px] font-bold text-gray-400 hover:text-[#E8521A] transition-colors"
                    >
                      Reset All
                    </button>
                    <button
                      onClick={() => setShowFilterDropdown(false)}
                      className="bg-[#1A1A1A] hover:bg-gray-800 text-white rounded-full px-4 py-1.5 text-[10px] font-bold transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Name or Subject..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 bg-white rounded-lg outline-none focus:border-[#E8521A] transition-colors"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyAssignments />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
