import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function EmptyAssignments() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-6">
      {/* Illustration */}
      <div className="relative mb-6">
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Document stack background */}
          <rect x="30" y="20" width="75" height="90" rx="8" fill="#E5E7EB" />
          <rect x="24" y="26" width="75" height="90" rx="8" fill="#F3F4F6" />
          <rect x="18" y="32" width="75" height="90" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
          {/* Lines on doc */}
          <rect x="30" y="50" width="50" height="4" rx="2" fill="#E5E7EB" />
          <rect x="30" y="60" width="40" height="4" rx="2" fill="#E5E7EB" />
          <rect x="30" y="70" width="45" height="4" rx="2" fill="#E5E7EB" />
          <rect x="30" y="80" width="35" height="4" rx="2" fill="#E5E7EB" />
          {/* Magnifying glass */}
          <circle cx="90" cy="90" r="28" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2" />
          <circle cx="90" cy="90" r="20" fill="white" stroke="#D1D5DB" strokeWidth="2" />
          {/* X mark */}
          <line x1="83" y1="83" x2="97" y2="97" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
          <line x1="97" y1="83" x2="83" y2="97" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
          {/* Handle */}
          <line x1="112" y1="112" x2="122" y2="122" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round" />
          {/* Sparkles */}
          <circle cx="22" cy="38" r="3" fill="#E8521A" opacity="0.6" />
          <circle cx="105" cy="45" r="2" fill="#E8521A" opacity="0.4" />
          <path d="M115 60 L117 55 L119 60 L124 58 L119 62 L117 67 L115 62 L110 58 Z" fill="#E8521A" opacity="0.3" />
        </svg>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-2">No assignments yet</h2>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">
        Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>

      <Link
        href="/assignments/create"
        className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        <Sparkles size={16} />
        Create Your First Assignment
      </Link>
    </div>
  );
}
