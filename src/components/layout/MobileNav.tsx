"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Library, Wrench } from "lucide-react";

const ITEMS = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Assignments", icon: BookOpen, href: "/assignments" },
  { label: "Library", icon: Library, href: "/library" },
  { label: "AI Toolkit", icon: Wrench, href: "/toolkit" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black flex items-center justify-around px-2 py-2.5 z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.2)]">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors group ${
              isActive ? "text-white" : "text-[#888888] hover:text-white"
            }`}
          >
            <Icon
              size={18}
              className={`transition-colors ${
                isActive ? "text-white" : "text-[#888888] group-hover:text-white"
              }`}
            />
            <span
              className={`text-[9px] font-semibold tracking-wide transition-colors ${
                isActive ? "text-white" : "text-[#888888] group-hover:text-white"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
