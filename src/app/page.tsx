"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Calendar, Clock, Plus, Users, Sparkles, GraduationCap } from "lucide-react";
import { useAssignmentStore } from "@/store/assignmentStore";
import MobileHeader from "@/components/layout/MobileHeader";

export default function HomePage() {
  const router = useRouter();
  const { assignments } = useAssignmentStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCount = assignments.length;
  const processingCount = assignments.filter(
    (a) => a.generationStatus === "PENDING" || a.generationStatus === "PROCESSING"
  ).length;

  // Sort assignments by due date to show upcoming deadlines first
  const upcomingAssignments = [...assignments]
    .filter((a) => a.dueDate)
    .sort((a, b) => {
      const parseDate = (dStr: string) => {
        const parts = dStr.split("-").map(Number);
        if (parts.length === 3) {
          return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
        }
        return new Date(dStr).getTime();
      };
      return parseDate(a.dueDate) - parseDate(b.dueDate);
    })
    .slice(0, 5); // Show top 5 upcoming deadlines

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden min-h-full bg-gray-50 pb-20">
        <MobileHeader />
        
        {/* Welcome Profile Section */}
        <div className="px-4 pt-5 pb-4 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between gap-3.5">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center border-2 border-orange-200 shrink-0">
                <span className="text-[#E8521A] text-lg font-bold">J</span>
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-gray-900 truncate">Welcome, John Doe!</h2>
                <p className="text-xs text-gray-500 font-medium truncate">Delhi Public School, Bokaro Steel City</p>
              </div>
            </div>
            <Link
              href="/assignments/create"
              className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-gray-800 text-white rounded-full px-3.5 py-2 text-xs font-semibold shrink-0 transition-colors"
            >
              <Sparkles size={12} className="text-white" />
              <span>Create</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-4 py-4 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col justify-between h-24">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Papers</span>
            <div className="flex items-end justify-between">
              {!mounted ? (
                <div className="h-7 w-10 bg-gray-100 rounded animate-pulse mb-1" />
              ) : (
                <span className="text-2xl font-bold text-gray-900">{totalCount}</span>
              )}
              <BookOpen size={16} className="text-[#E8521A] mb-1" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col justify-between h-24">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Active Queue</span>
            <div className="flex items-end justify-between">
              {!mounted ? (
                <div className="h-7 w-10 bg-gray-100 rounded animate-pulse mb-1" />
              ) : (
                <span className="text-2xl font-bold text-gray-900">{processingCount}</span>
              )}
              <Clock size={16} className="text-blue-500 mb-1" />
            </div>
          </div>
        </div>

        {/* Agenda / Deadlines */}
        <div className="px-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Upcoming Deadlines</h3>
            {mounted && totalCount > 0 && (
              <Link href="/assignments" className="text-xs font-semibold text-[#E8521A]">
                View All
              </Link>
            )}
          </div>

          {!mounted ? (
            <div className="space-y-2">
              <div className="h-16 bg-white rounded-2xl border border-gray-50 animate-pulse" />
              <div className="h-16 bg-white rounded-2xl border border-gray-50 animate-pulse" />
            </div>
          ) : upcomingAssignments.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center space-y-3">
              <Calendar size={32} className="text-gray-300 mx-auto" />
              <p className="text-xs text-gray-400">No upcoming assignment deadlines found.</p>
              <Link
                href="/assignments/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-semibold rounded-full"
              >
                <Sparkles size={12} />
                Create Paper
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  onClick={() => router.push(`/assignments/${assignment.id}`)}
                  className="bg-white rounded-2xl p-4 border border-gray-100 active:bg-gray-50 flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800 truncate">{assignment.title}</p>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      <Clock size={10} />
                      Due: {assignment.dueDate}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                      assignment.generationStatus === "COMPLETED"
                        ? "bg-green-50 text-green-600"
                        : assignment.generationStatus === "FAILED"
                          ? "bg-red-50 text-red-600"
                          : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {assignment.generationStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block animate-fade-in pb-10">
        {/* Welcome Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <p className="text-sm text-gray-500 ml-4">
              Overview of your classes, papers, and active AI tasks.
            </p>
          </div>
        </div>

        {/* Top Profile Banner */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="w-14 h-14 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center text-[#E8521A] text-xl font-bold">
              JD
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Welcome Back, John Doe!</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Teacher account for <span className="font-semibold text-gray-600">Delhi Public School, Bokaro Steel City</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-orange-50/50 rounded-xl px-4 py-2 border border-orange-100/50">
            <GraduationCap size={16} className="text-[#E8521A]" />
            <span className="text-xs font-bold text-gray-700">CBSE Curriculum Active</span>
          </div>
        </div>

        {/* Stats & Deadlines Columns */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Columns - Stats & Info */}
          <div className="col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Papers</p>
                {!mounted ? (
                  <div className="h-8 w-12 bg-gray-100 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-3xl font-extrabold text-gray-900">{totalCount}</p>
                )}
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                <BookOpen size={18} className="text-[#E8521A]" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Active Queue</p>
                {!mounted ? (
                  <div className="h-8 w-12 bg-gray-100 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-3xl font-extrabold text-gray-900">{processingCount}</p>
                )}
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Clock size={18} className="text-blue-500" />
              </div>
            </div>
          </div>

          {/* Right Column - Upcoming Deadlines */}
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Upcoming Assignment Deadlines</h3>
                {mounted && totalCount > 0 && (
                  <Link href="/assignments" className="text-xs font-bold text-[#E8521A] hover:underline">
                    View All
                  </Link>
                )}
              </div>

              {!mounted ? (
                <div className="space-y-3">
                  <div className="h-16 bg-gray-50 border border-gray-50/50 rounded-xl animate-pulse" />
                  <div className="h-16 bg-gray-50 border border-gray-50/50 rounded-xl animate-pulse" />
                </div>
              ) : upcomingAssignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center text-gray-400">
                  <Calendar size={36} className="text-gray-300" />
                  <p className="text-xs">No upcoming assignment deadlines found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      onClick={() => router.push(`/assignments/${assignment.id}`)}
                      className="flex items-center justify-between p-3.5 border border-gray-50 rounded-xl hover:border-gray-200 transition-colors cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-800 truncate">{assignment.title}</p>
                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                          <Clock size={10} />
                          Due Date: {assignment.dueDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            assignment.generationStatus === "COMPLETED"
                              ? "bg-green-50 text-green-600"
                              : assignment.generationStatus === "FAILED"
                                ? "bg-red-50 text-red-600"
                                : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {assignment.generationStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
