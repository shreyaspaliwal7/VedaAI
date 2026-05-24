"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  BookOpen,
  Wrench,
  Library,
  Settings,
  Sparkles,
} from "lucide-react";
import { useAssignmentStore } from "@/store/assignmentStore";

export default function Sidebar() {
  const pathname = usePathname();
  const assignments = useAssignmentStore((state) => state.assignments);
  const assignmentsCount = assignments.length;

  const NAV_ITEMS = [
    { label: "Home", icon: Home, href: "/" },
    { label: "My Groups", icon: Users, href: "/groups" },
    { label: "Assignments", icon: BookOpen, href: "/assignments", badge: assignmentsCount },
    { label: "AI Teacher's Toolkit", icon: Wrench, href: "/toolkit" },
    { label: "My Library", icon: Library, href: "/library" },
  ];

  return (
    <aside className="w-[200px] bg-white border-r border-gray-100 flex flex-col h-full shrink-0">
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center gap-2">
        <img width="50" src="\logo3.png" alt="" />
        <span className="font-sans font-bold text-[28px] tracking-[-0.05em] text-[#2d3134]">
          VedaAI
        </span>
      </div>

      {/* CTA Button */}
      <div className="px-3 pt-4 pb-2">
        <Link
          href="/assignments/create"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-[#1A1A1A] text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Sparkles size={14} />
          <span>Create Assignment</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 pt-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${isActive
                ? "active text-[#E8521A] bg-orange-50"
                : "text-gray-600"
                }`}
            >
              <Icon size={16} className={isActive ? "text-[#E8521A]" : "text-gray-500"} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-[#E8521A] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-2">
        <Link
          href="/settings"
          className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500"
        >
          <Settings size={16} />
          <span>Settings</span>
        </Link>

        {/* School card */}
        <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 overflow-hidden">
            <span className="text-[#E8521A] text-xs font-bold">D</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">Delhi Public School</p>
            <p className="text-[10px] text-gray-500 truncate">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
