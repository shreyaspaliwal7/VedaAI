import { QuestionBlock } from "@/types";

const DUE_DATE_REGEX = /^\d{2}-\d{2}-\d{4}$/;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function parseDueDate(dueDate: string): Date | null {
  if (!DUE_DATE_REGEX.test(dueDate)) return null;
  const [day, month, year] = dueDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getDate() !== day ||
    date.getMonth() !== month - 1 ||
    date.getFullYear() !== year
  ) {
    return null;
  }
  return date;
}

export function validateCreateAssignment(
  dueDate: string,
  blocks: QuestionBlock[]
): ValidationResult {
  const errors: string[] = [];

  if (!dueDate.trim()) {
    errors.push("Due date is required.");
  } else {
    const parsed = parseDueDate(dueDate.trim());
    if (!parsed) {
      errors.push("Due date must be valid (DD-MM-YYYY).");
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsed < today) {
        errors.push("Due date cannot be in the past.");
      }
    }
  }

  if (blocks.length === 0) {
    errors.push("Add at least one question type.");
  }

  blocks.forEach((block, index) => {
    if (block.noOfQuestions < 1) {
      errors.push(`Block ${index + 1}: number of questions must be at least 1.`);
    }
    if (block.marks < 1) {
      errors.push(`Block ${index + 1}: marks must be at least 1.`);
    }
    if (!Number.isInteger(block.noOfQuestions)) {
      errors.push(`Block ${index + 1}: number of questions must be a whole number.`);
    }
  });

  const totalQuestions = blocks.reduce((s, b) => s + b.noOfQuestions, 0);
  if (blocks.length > 0 && totalQuestions < 1) {
    errors.push("Total questions must be at least 1.");
  }

  return { valid: errors.length === 0, errors };
}

export function formatDueDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

/** DD-MM-YYYY → YYYY-MM-DD for native date input */
export function dueDateToIso(dueDate: string): string {
  if (!DUE_DATE_REGEX.test(dueDate)) return "";
  const [day, month, year] = dueDate.split("-");
  return `${year}-${month}-${day}`;
}

/** YYYY-MM-DD → DD-MM-YYYY for API */
export function isoToDueDate(iso: string): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  return `${day}-${month}-${year}`;
}

export function todayIsoDate(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
