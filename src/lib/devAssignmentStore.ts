import { v4 as uuidv4 } from "uuid";
import {
  AssignmentApiResponse,
  CreateAssignmentPayload,
  GenerationStatus,
  GeneratedPaper,
} from "@/types";
import { formatDateFromDate, parseDueDateString } from "@/lib/assignmentDates";
import { generateExamPaper, isGeminiConfigured } from "@/lib/geminiService";

interface StoredAssignment {
  assignmentId: string;
  title: string;
  assignedOn: string;
  dueDate: string;
  subject?: string;
  className?: string;
  school?: string;
  additionalInfo?: string;
  questionBlocks: CreateAssignmentPayload["questionBlocks"];
  status: GenerationStatus;
  publishStatus: "draft" | "published";
  generatedPaper: GeneratedPaper | null;
  errorMessage: string | null;
  createdAt: string;
}

const globalStore = globalThis as typeof globalThis & {
  __vedaaiDevAssignments?: Map<string, StoredAssignment>;
};

function getStore(): Map<string, StoredAssignment> {
  if (!globalStore.__vedaaiDevAssignments) {
    globalStore.__vedaaiDevAssignments = new Map();
  }
  return globalStore.__vedaaiDevAssignments;
}

function toApiResponse(record: StoredAssignment): AssignmentApiResponse {
  return {
    assignmentId: record.assignmentId,
    title: record.title,
    assignedOn: record.assignedOn,
    dueDate: record.dueDate,
    subject: record.subject,
    className: record.className,
    school: record.school,
    additionalInfo: record.additionalInfo,
    questionBlocks: record.questionBlocks.map((b, i) => ({
      id: `block-${i}`,
      ...b,
    })),
    status: record.status,
    publishStatus: record.publishStatus,
    generatedPaper: record.generatedPaper,
    errorMessage: record.errorMessage,
    createdAt: record.createdAt,
  };
}

function runAiGeneration(assignmentId: string): void {
  void (async () => {
    const store = getStore();
    const record = store.get(assignmentId);
    if (!record) return;

    record.status = "PROCESSING";
    record.errorMessage = null;
    store.set(assignmentId, record);

    try {
      if (!isGeminiConfigured()) {
        throw new Error(
          "GEMINI_API_KEY is not set. Add your key to .env.local in the project root, then restart npm run dev."
        );
      }

      const paper = await generateExamPaper({
        title: record.title,
        dueDate: record.dueDate,
        additionalInfo: record.additionalInfo,
        subject: record.subject,
        className: record.className,
        school: record.school,
        questionBlocks: record.questionBlocks,
      });

      record.generatedPaper = paper;
      record.status = "COMPLETED";
      record.errorMessage = null;
    } catch (err) {
      record.status = "FAILED";
      record.errorMessage =
        err instanceof Error ? err.message : "AI generation failed";
    }
    store.set(assignmentId, record);
  })();
}

export function devCreateAssignment(
  payload: CreateAssignmentPayload
): { assignmentId: string; status: GenerationStatus; publishStatus: "draft" | "published" } {
  const parsedDue = parseDueDateString(payload.dueDate);
  if (!parsedDue) {
    throw new Error("Invalid due date");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsedDue < today) {
    throw new Error("Due date cannot be in the past");
  }

  if (!payload.questionBlocks?.length) {
    throw new Error("At least one question block is required");
  }

  const assignmentId = uuidv4();
  const record: StoredAssignment = {
    assignmentId,
    title: payload.title?.trim() || "Generated Assessment",
    assignedOn: formatDateFromDate(new Date()),
    dueDate: payload.dueDate.trim(),
    subject: payload.subject,
    className: payload.className,
    school: payload.school,
    additionalInfo: payload.additionalInfo,
    questionBlocks: payload.questionBlocks,
    status: "PENDING",
    publishStatus: "draft",
    generatedPaper: null,
    errorMessage: null,
    createdAt: new Date().toISOString(),
  };

  getStore().set(assignmentId, record);
  setTimeout(() => runAiGeneration(assignmentId), 100);

  return { assignmentId, status: "PENDING", publishStatus: "draft" };
}

export function devGetAssignment(
  id: string
): AssignmentApiResponse | null {
  const record = getStore().get(id);
  return record ? toApiResponse(record) : null;
}

export function devRegenerateAssignment(
  id: string,
  additionalInfo?: string
): { assignmentId: string; status: GenerationStatus; publishStatus: "draft" | "published" } | null {
  const store = getStore();
  const record = store.get(id);
  if (!record) return null;

  if (additionalInfo !== undefined) {
    record.additionalInfo = additionalInfo;
  }
  record.status = "PENDING";
  record.generatedPaper = null;
  record.errorMessage = null;
  store.set(id, record);

  setTimeout(() => runAiGeneration(id), 100);

  return {
    assignmentId: id,
    status: "PENDING",
    publishStatus: record.publishStatus,
  };
}

export function devPublishAssignment(
  id: string
): { assignmentId: string; status: GenerationStatus; publishStatus: "draft" | "published" } | null {
  const store = getStore();
  const record = store.get(id);
  if (!record) return null;

  record.publishStatus = "published";
  store.set(id, record);

  return {
    assignmentId: id,
    status: record.status,
    publishStatus: "published",
  };
}
