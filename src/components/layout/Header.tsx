"use client";

import { useState } from "react";
import { Bell, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useNotificationStore } from "@/store/notificationStore";
import NotificationPanel from "./NotificationPanel";

const BREADCRUMB_MAP: Record<string, string> = {
  "/assignments": "Assignment",
  "/assignments/create": "Assignment",
  "/toolkit": "AI Teacher's Toolkit",
  "/library": "My Library",
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumb = BREADCRUMB_MAP[pathname] ?? "";
  const showBack = pathname !== "/" && pathname !== "/assignments";

  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 hover:text-gray-800 transition-colors mr-1"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        {breadcrumb && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 border border-gray-300 rounded grid grid-cols-2 gap-0.5 p-0.5">
                <span className="bg-gray-400 rounded-sm" />
                <span className="bg-gray-400 rounded-sm" />
                <span className="bg-gray-400 rounded-sm" />
                <span className="bg-gray-400 rounded-sm" />
              </span>
              {breadcrumb}
            </span>
          </>
        )}
        {pathname === "/assignments/create" && (
          <>
            <span className="text-gray-300">/</span>
            <span className="text-gray-800 font-medium">Create New</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Bell Icon relative wrapper */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
          >
            <Bell size={18} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#E8521A] rounded-full border border-white" />
            )}
          </button>
          {showNotifications && (
            <NotificationPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>

        <button className="flex items-center gap-2 hover:bg-gray-50 rounded-full px-2 py-1 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
            <User size={14} className="text-gray-500" />
          </div>
          <span className="text-sm font-medium text-gray-700">John Doe</span>
        </button>
      </div>
    </header>
  );
}
