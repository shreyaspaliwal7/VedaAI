import { z } from "zod";

const questionTypeEnum = z.enum([
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Long Answer Questions",
  "True/False Questions",
]);

const questionBlockSchema = z.object({
  type: questionTypeEnum,
  noOfQuestions: z.number().int().min(1, "Number of questions must be at least 1"),
  marks: z.number().min(1, "Marks must be at least 1"),
});

const dueDateRegex = /^\d{2}-\d{2}-\d{4}$/;

export const createAssignmentSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  dueDate: z
    .string()
    .trim()
    .regex(dueDateRegex, "Due date must be in DD-MM-YYYY format"),
  additionalInfo: z.string().max(5000).optional(),
  subject: z.string().max(100).optional(),
  className: z.string().max(50).optional(),
  school: z.string().max(200).optional(),
  questionBlocks: z
    .array(questionBlockSchema)
    .min(1, "At least one question block is required"),
});

export function parseDueDate(dueDate: string): Date {
  const [day, month, year] = dueDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isDueDateValid(dueDate: string): boolean {
  if (!dueDateRegex.test(dueDate)) return false;
  const parsed = parseDueDate(dueDate);
  if (Number.isNaN(parsed.getTime())) return false;
  const [day, month, year] = dueDate.split("-").map(Number);
  return (
    parsed.getDate() === day &&
    parsed.getMonth() === month - 1 &&
    parsed.getFullYear() === year
  );
}

export function formatDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}
