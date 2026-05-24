"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import { Assignment } from "@/types";
import { useAssignmentStore } from "@/store/assignmentStore";
import { useRouter } from "next/navigation";

interface AssignmentCardProps {
  assignment: Assignment;
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { deleteAssignment } = useAssignmentStore();
  const router = useRouter();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigating if the user clicked inside the 3-dot menu or dropdown
    if (menuRef.current && menuRef.current.contains(e.target as Node)) {
      return;
    }
    router.push(`/assignments/${assignment.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="assignment-card bg-white rounded-2xl p-4 border border-gray-100 hover:border-gray-300 relative cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-[14px] mb-2 truncate">
            {assignment.title}
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>
              <span className="text-gray-400">Assigned on </span>
              <span className="font-medium text-gray-600">{assignment.assignedOn}</span>
            </span>
            {assignment.dueDate && (
              <span>
                <span className="text-gray-400">Due </span>
                <span className="font-medium text-gray-600">{assignment.dueDate}</span>
              </span>
            )}
          </div>
        </div>

        {/* 3-dot menu */}
        <div ref={menuRef} className="relative ml-2 shrink-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen((v) => !v);
            }}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical size={16} className="text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-7 w-32 bg-white rounded-xl border border-gray-100 dropdown-shadow z-50 animate-fade-in overflow-hidden">
              <button
                onClick={() => {
                  deleteAssignment(assignment.id);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
