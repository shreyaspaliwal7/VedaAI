"use client";

import { useRef } from "react";
import { Calendar } from "lucide-react";
import {
  dueDateToIso,
  formatDueDateInput,
  isoToDueDate,
  todayIsoDate,
} from "@/lib/validation";

interface DueDateFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DueDateField({ value, onChange }: DueDateFieldProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const isoValue = dueDateToIso(value);

  const openCalendar = () => {
    const input = dateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.click();
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(formatDueDateInput(e.target.value))}
        placeholder="DD-MM-YYYY"
        maxLength={10}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#E8521A] transition-colors pr-11"
      />
      <button
        type="button"
        onClick={openCalendar}
        aria-label="Pick due date from calendar"
        className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#E8521A] rounded-lg hover:bg-orange-50 transition-colors"
      >
        <Calendar size={16} />
      </button>
      <input
        ref={dateInputRef}
        type="date"
        value={isoValue}
        min={todayIsoDate()}
        onChange={(e) => onChange(isoToDueDate(e.target.value))}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />
    </div>
  );
}
