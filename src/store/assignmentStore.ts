import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Assignment,
  GeneratedPaper,
  GenerationStatus,
  AssignmentApiResponse,
} from "@/types";

interface AssignmentStore {
  assignments: Assignment[];
  draftAssignment: Partial<Assignment> | null;

  addAssignment: (assignment: Assignment) => void;
  deleteAssignment: (id: string) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  setDraft: (draft: Partial<Assignment> | null) => void;
  updateDraft: (updates: Partial<Assignment>) => void;
  setGeneratedPaper: (id: string, paper: GeneratedPaper) => void;
  syncFromApi: (data: AssignmentApiResponse) => void;
  getAssignment: (id: string) => Assignment | undefined;
  publishAssignment: (id: string) => void;
}

function mapApiToAssignment(data: AssignmentApiResponse): Assignment {
  return {
    id: data.assignmentId,
    title: data.title,
    assignedOn: data.assignedOn,
    dueDate: data.dueDate,
    subject: data.subject,
    className: data.className,
    school: data.school,
    additionalInfo: data.additionalInfo,
    questionBlocks: data.questionBlocks.map((b, i) => ({
      id: `block-${i}`,
      type: b.type,
      noOfQuestions: b.noOfQuestions,
      marks: b.marks,
    })),
    status: data.publishStatus ?? "draft",
    generationStatus: data.status,
    errorMessage: data.errorMessage ?? undefined,
    generatedPaper: data.generatedPaper ?? undefined,
  };
}

export const useAssignmentStore = create<AssignmentStore>()(
  persist(
    (set, get) => ({
      assignments: [],
      draftAssignment: null,

      addAssignment: (assignment) =>
        set((state) => ({
          assignments: [assignment, ...state.assignments],
        })),

      deleteAssignment: (id) =>
        set((state) => ({
          assignments: state.assignments.filter((a) => a.id !== id),
        })),

      updateAssignment: (id, updates) =>
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      setDraft: (draft) => set({ draftAssignment: draft }),

      updateDraft: (updates) =>
        set((state) => ({
          draftAssignment: state.draftAssignment
            ? { ...state.draftAssignment, ...updates }
            : updates,
        })),

      setGeneratedPaper: (id, paper) =>
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === id
              ? { ...a, generatedPaper: paper, generationStatus: "COMPLETED" as GenerationStatus }
              : a
          ),
        })),

      syncFromApi: (data) => {
        const mapped = mapApiToAssignment(data);
        set((state) => {
          const exists = state.assignments.some((a) => a.id === mapped.id);
          return {
            assignments: exists
              ? state.assignments.map((a) => (a.id === mapped.id ? mapped : a))
              : [mapped, ...state.assignments],
          };
        });
      },

      getAssignment: (id) => get().assignments.find((a) => a.id === id),

      publishAssignment: (id) =>
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === id ? { ...a, status: "published" as const } : a
          ),
        })),
    }),
    { name: "vedaai-assignments" }
  )
);
