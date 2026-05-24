"use client";

import { useNotificationStore, NotificationItem } from "@/store/notificationStore";
import { Bell, CheckCheck, Trash2, X, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NotificationPanelProps {
  onClose: () => void;
  isMobile?: boolean;
}

export default function NotificationPanel({ onClose, isMobile = false }: NotificationPanelProps) {
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotificationStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Simple timeago formatter
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return "Some time ago";
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    onClose();
    if (item.redirectTo) {
      router.push(item.redirectTo);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className={`bg-white border border-gray-100 shadow-xl rounded-2xl flex flex-col overflow-hidden animate-fade-in ${
        isMobile
          ? "fixed inset-x-4 top-16 max-h-[70vh] z-[999]"
          : "absolute right-0 top-11 w-[360px] max-h-[480px] z-50"
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-[#E8521A]" />
          <span className="font-bold text-gray-800 text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-[#E8521A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {notifications.length > 0 && (
            <>
              <button
                onClick={() => markAllAsRead()}
                title="Mark all as read"
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-[#E8521A]"
              >
                <CheckCheck size={14} />
              </button>
              <button
                onClick={() => clearNotifications()}
                title="Clear all"
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-700"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#E8521A] opacity-60">
              <Bell size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">All caught up!</p>
              <p className="text-[11px] text-gray-400 mt-0.5">No notifications yet.</p>
            </div>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-3.5 hover:bg-gray-50/70 transition-colors cursor-pointer flex gap-3 relative border-l-4 ${
                item.read ? "border-l-transparent bg-white" : "border-l-[#E8521A] bg-orange-50/10"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`text-xs truncate ${item.read ? "font-semibold text-gray-700" : "font-bold text-gray-900"}`}>
                    {item.title}
                  </h4>
                  <span className="text-[9px] text-gray-400 font-medium whitespace-nowrap shrink-0 flex items-center gap-0.5">
                    <Clock size={8} />
                    {formatTime(item.timestamp)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed line-clamp-2">
                  {item.message}
                </p>
                {!item.read && (
                  <span className="absolute bottom-3 right-3 w-1.5 h-1.5 bg-[#E8521A] rounded-full" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
