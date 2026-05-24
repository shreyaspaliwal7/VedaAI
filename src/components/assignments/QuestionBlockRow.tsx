"use client";

import { X, ChevronDown } from "lucide-react";
import { QuestionBlock, QuestionType } from "@/types";
import { useState, useRef, useEffect } from "react";

const QUESTION_TYPES: QuestionType[] = [
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Long Answer Questions",
  "True/False Questions",
];

interface QuestionBlockRowProps {
  block: QuestionBlock;
  onChange: (id: string, updates: Partial<QuestionBlock>) => void;
  onRemove: (id: string) => void;
}

export default function QuestionBlockRow({ block, onChange, onRemove }: QuestionBlockRowProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const Stepper = ({
    value,
    onInc,
    onDec,
  }: {
    value: number;
    onInc: () => void;
    onDec: () => void;
  }) => (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-full px-2.5 py-1.5 w-full">
      <button
        type="button"
        onClick={onDec}
        className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-gray-900 transition-colors text-sm font-light select-none"
      >
        −
      </button>
      <span className="text-xs font-semibold text-gray-700 text-center flex-1">{value}</span>
      <button
        type="button"
        onClick={onInc}
        className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-gray-900 transition-colors text-sm font-light select-none"
      >
        +
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-3.5 w-full bg-gray-50/50 p-4 border border-gray-200/60 rounded-2xl md:flex-row md:items-center md:gap-3 md:bg-transparent md:p-0 md:border-0 md:rounded-none animate-fade-in py-1">
      {/* Top row for mobile dropdown and remove */}
      <div className="flex items-center gap-2.5 w-full md:flex-1">
        {/* Type Dropdown selector */}
        <div className="relative flex-1" ref={dropRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="w-full flex items-center justify-between text-xs text-gray-700 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 transition-all font-semibold"
          >
            <span className="truncate">{block.type}</span>
            <ChevronDown size={14} className="text-gray-400 ml-2 shrink-0" />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl dropdown-shadow z-50 overflow-hidden">
              {QUESTION_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    onChange(block.id, { type: t });
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                    block.type === t
                      ? "bg-orange-50 text-[#E8521A] font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Remove (x) button */}
        <button
          type="button"
          onClick={() => onRemove(block.id)}
          className="w-9.5 h-9.5 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl shrink-0 text-xl font-light leading-none select-none border border-gray-200 bg-white md:border-0 md:bg-transparent md:w-6 md:h-6 md:p-0 md:text-lg md:rounded-lg"
        >
          ×
        </button>
      </div>

      {/* Steppers container */}
      <div className="grid grid-cols-2 gap-3 w-full md:flex md:w-auto md:gap-3 shrink-0">
        {/* No. of Questions pill-stepper */}
        <div className="flex flex-col gap-1 w-full md:w-24">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider md:hidden px-1">
            No. of Questions
          </span>
          <Stepper
            value={block.noOfQuestions}
            onInc={() => onChange(block.id, { noOfQuestions: block.noOfQuestions + 1 })}
            onDec={() =>
              onChange(block.id, { noOfQuestions: Math.max(1, block.noOfQuestions - 1) })
            }
          />
        </div>

        {/* Marks pill-stepper */}
        <div className="flex flex-col gap-1 w-full md:w-24">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider md:hidden px-1">
            Marks per Q
          </span>
          <Stepper
            value={block.marks}
            onInc={() => onChange(block.id, { marks: block.marks + 1 })}
            onDec={() => onChange(block.id, { marks: Math.max(1, block.marks - 1) })}
          />
        </div>
      </div>
    </div>
  );
}
