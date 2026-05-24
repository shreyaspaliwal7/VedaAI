"use client";

import { useState } from "react";
import { Bell, Menu, ArrowLeft, X, Users, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/store/notificationStore";
import NotificationPanel from "./NotificationPanel";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
}

export default function MobileHeader({ title, showBack }: MobileHeaderProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 relative z-40">
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        {showBack && (
          <button onClick={() => router.back()} className="p-1 shrink-0">
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
        )}
        
        {/* Always display the brand Logo icon symbol */}
        <img width="26" src="\logo3.png" alt="VedaAI" className="shrink-0 ml-0.5" />

        {/* If no subpage title is specified, show the full VedaAI brand name */}
        {!title && (
          <span className="font-sans font-bold text-[18px] tracking-[-0.05em] text-[#2d3134] shrink-0">
            VedaAI
          </span>
        )}

        {/* If a subpage title is specified, show a premium vertical divider and the title */}
        {title && (
          <>
            <span className="text-gray-300 mx-0.5 shrink-0 font-light text-sm select-none">|</span>
            <span className="font-sans font-bold text-[13.5px] text-gray-900 truncate flex-1 leading-none pt-0.5">
              {title}
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {/* Bell Icon relative wrapper */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2"
          >
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E8521A] rounded-full border border-white" />
            )}
          </button>
          {showNotifications && (
            <NotificationPanel onClose={() => setShowNotifications(false)} isMobile />
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-600 text-xs font-semibold">J</span>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <Menu size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Slide-out Mobile Menu Drawer */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 z-[999] transition-opacity animate-fade-in print:hidden"
          />
          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 h-full w-[240px] bg-white z-[1000] shadow-2xl flex flex-col p-5 animate-slide-in-right print:hidden">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <span className="font-sans font-bold text-gray-800 text-base">Menu</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 space-y-1">
              <Link
                href="/groups"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-[#E8521A] transition-all font-medium text-sm"
              >
                <Users size={16} className="text-gray-500" />
                <span>My Groups</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-[#E8521A] transition-all font-medium text-sm"
              >
                <SettingsIcon size={16} className="text-gray-500" />
                <span>Settings</span>
              </Link>
            </div>

            {/* Profile Card inside Drawer */}
            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2.5 mt-auto">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <span className="text-[#E8521A] text-xs font-bold">J</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">John Doe</p>
                <p className="text-[10px] text-gray-500 truncate">Delhi Public School</p>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
