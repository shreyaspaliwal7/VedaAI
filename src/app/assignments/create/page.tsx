"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Sparkles, Mic, ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { QuestionBlock } from "@/types";
import { useAssignmentStore } from "@/store/assignmentStore";
import { createAssignment, ApiError } from "@/lib/api";
import { validateCreateAssignment } from "@/lib/validation";
import QuestionBlockRow from "@/components/assignments/QuestionBlockRow";
import DueDateField from "@/components/assignments/DueDateField";
import ReferenceFileUpload, {
  UploadedReferenceFile,
  buildReferenceFilesNote,
  revokeReferenceFileUrls,
} from "@/components/assignments/ReferenceFileUpload";
import MobileHeader from "@/components/layout/MobileHeader";

const DEFAULT_BLOCKS: QuestionBlock[] = [
  { id: "b1", type: "Multiple Choice Questions", noOfQuestions: 4, marks: 1 },
  { id: "b2", type: "Short Questions", noOfQuestions: 3, marks: 2 },
  { id: "b3", type: "Diagram/Graph-Based Questions", noOfQuestions: 5, marks: 5 },
  { id: "b4", type: "Numerical Problems", noOfQuestions: 5, marks: 5 },
];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { addAssignment } = useAssignmentStore();

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [blocks, setBlocks] = useState<QuestionBlock[]>(DEFAULT_BLOCKS);
  const [referenceFiles, setReferenceFiles] = useState<UploadedReferenceFile[]>([]);
  const referenceFilesRef = useRef(referenceFiles);
  referenceFilesRef.current = referenceFiles;
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => revokeReferenceFileUrls(referenceFilesRef.current);
  }, []);

  const totalQuestions = blocks.reduce((sum, b) => sum + b.noOfQuestions, 0);
  const totalMarks = blocks.reduce((sum, b) => sum + b.noOfQuestions * b.marks, 0);

  const handleBlockChange = useCallback(
    (id: string, updates: Partial<QuestionBlock>) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
      );
    },
    []
  );

  const handleBlockRemove = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const addBlock = () => {
    setBlocks((prev) => [
      ...prev,
      {
        id: uuidv4(),
        type: "Multiple Choice Questions",
        noOfQuestions: 4,
        marks: 1,
      },
    ]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const validation = validateCreateAssignment(dueDate, blocks);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors([]);
    setSubmitting(true);

    const assignmentTitle = title.trim() || "Generated Assessment";
    const referenceNote = buildReferenceFilesNote(referenceFiles);
    const combinedInfo = `${additionalInfo.trim()}${referenceNote}`.trim();

    try {
      const { assignmentId } = await createAssignment({
        title: assignmentTitle,
        dueDate: dueDate.trim(),
        additionalInfo: combinedInfo || undefined,
        questionBlocks: blocks.map(({ type, noOfQuestions, marks }) => ({
          type,
          noOfQuestions,
          marks,
        })),
      });

      const today = new Date();
      const fmt = (d: Date) =>
        `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;

      addAssignment({
        id: assignmentId,
        title: assignmentTitle,
        assignedOn: fmt(today),
        dueDate: dueDate.trim(),
        status: "draft",
        generationStatus: "PENDING",
        questionBlocks: blocks,
        additionalInfo: combinedInfo || undefined,
      });

      router.push(`/assignments/${assignmentId}`);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to create assignment. Please try again.";
      setErrors([message]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden bg-gray-50 min-h-full">
        <MobileHeader title="Create Assignment" showBack />
        <div className="px-4 py-4 space-y-4 pb-24">
          {errors.length > 0 && <ErrorBanner errors={errors} />}
          <FormContent
            title={title}
            setTitle={setTitle}
            dueDate={dueDate}
            setDueDate={setDueDate}
            additionalInfo={additionalInfo}
            setAdditionalInfo={setAdditionalInfo}
            onSubmit={handleSubmit}
            blocks={blocks}
            onBlockChange={handleBlockChange}
            onBlockRemove={handleBlockRemove}
            onAddBlock={addBlock}
            totalQuestions={totalQuestions}
            totalMarks={totalMarks}
            referenceFiles={referenceFiles}
            onReferenceFilesChange={setReferenceFiles}
            onFileValidationError={setErrors}
          />
        </div>
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            disabled={submitting}
            className="flex items-center gap-2 border border-gray-200 rounded-full px-5 py-2.5 text-sm font-medium text-gray-700 disabled:opacity-50"
          >
            <ArrowLeft size={16} />
            Previous
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1A1A1A] text-white rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-60"
          >
            {submitting ? "Generating…" : "Next"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block animate-fade-in">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
            <h1 className="text-xl font-bold text-gray-900">Create Assignment</h1>
          </div>
          <p className="text-sm text-gray-500 ml-4">Set up a new assignment for your students</p>
          <div className="mt-3 h-1 bg-gray-200 rounded-full max-w-2xl ml-4">
            <div className="h-1 bg-gray-800 rounded-full w-1/2" />
          </div>
        </div>

        {errors.length > 0 && (
          <div className="mb-4 max-w-2xl">
            <ErrorBanner errors={errors} />
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-2xl">
          <h2 className="font-semibold text-gray-800 text-base mb-0.5">Assignment Details</h2>
          <p className="text-xs text-gray-400 mb-5">Basic information about your assignment</p>

          <FormContent
            title={title}
            setTitle={setTitle}
            dueDate={dueDate}
            setDueDate={setDueDate}
            additionalInfo={additionalInfo}
            setAdditionalInfo={setAdditionalInfo}
            onSubmit={handleSubmit}
            blocks={blocks}
            onBlockChange={handleBlockChange}
            onBlockRemove={handleBlockRemove}
            onAddBlock={addBlock}
            totalQuestions={totalQuestions}
            totalMarks={totalMarks}
            referenceFiles={referenceFiles}
            onReferenceFilesChange={setReferenceFiles}
            onFileValidationError={(fileErrors) =>
              setErrors(fileErrors)
            }
          />
        </div>

        <div className="flex items-center gap-3 mt-5 max-w-2xl">
          <button
            onClick={() => router.back()}
            disabled={submitting}
            className="flex items-center gap-2 border border-gray-300 rounded-full px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <ArrowLeft size={16} />
            Previous
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 bg-[#1A1A1A] text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors ml-auto disabled:opacity-60"
          >
            {submitting ? "Generating…" : "Next"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

function ErrorBanner({ errors }: { errors: string[] }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <ul className="list-disc list-inside space-y-0.5">
        {errors.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  );
}

function FormContent({
  title,
  setTitle,
  dueDate,
  setDueDate,
  additionalInfo,
  setAdditionalInfo,
  onSubmit,
  blocks,
  onBlockChange,
  onBlockRemove,
  onAddBlock,
  totalQuestions,
  totalMarks,
  referenceFiles,
  onReferenceFilesChange,
  onFileValidationError,
}: {
  title: string;
  setTitle: (v: string) => void;
  dueDate: string;
  setDueDate: (v: string) => void;
  additionalInfo: string;
  setAdditionalInfo: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  blocks: QuestionBlock[];
  onBlockChange: (id: string, updates: Partial<QuestionBlock>) => void;
  onBlockRemove: (id: string) => void;
  onAddBlock: () => void;
  totalQuestions: number;
  totalMarks: number;
  referenceFiles: UploadedReferenceFile[];
  onReferenceFilesChange: (files: UploadedReferenceFile[]) => void;
  onFileValidationError: (errors: string[]) => void;
}) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Assignment Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Grade 8 Science — Electricity Unit Test"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#E8521A] transition-colors"
        />
      </div>
      <ReferenceFileUpload
        files={referenceFiles}
        onChange={onReferenceFilesChange}
        onValidationError={onFileValidationError}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
        <DueDateField value={dueDate} onChange={setDueDate} />
      </div>

      <div>
        <label className="block md:hidden text-sm font-medium text-gray-700 mb-2.5">Question Types</label>
        <div className="hidden md:flex items-center gap-3 mb-2 text-xs text-gray-400 font-semibold px-1">
          <span className="flex-1 text-sm font-medium text-gray-700">Question Type</span>
          <span className="w-6" />
          <span className="w-24 text-center">No. of Questions</span>
          <span className="w-24 text-center">Marks</span>
        </div>
        <div className="space-y-2">
          {blocks.map((block) => (
            <QuestionBlockRow
              key={block.id}
              block={block}
              onChange={onBlockChange}
              onRemove={onBlockRemove}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onAddBlock}
          className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-800 hover:text-[#E8521A] transition-colors"
        >
          <span className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </span>
          Add Question Type
        </button>

        <div className="mt-3 flex justify-end gap-6 text-xs text-gray-500">
          <span>
            Total Questions :{" "}
            <span className="font-semibold text-gray-800">{totalQuestions}</span>
          </span>
          <span>
            Total Marks :{" "}
            <span className="font-semibold text-gray-800">{totalMarks}</span>
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Additional Information{" "}
          <span className="text-gray-400 font-normal">(For better output)</span>
        </label>
        <div className="relative">
          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="e.g. Generate a question paper for CBSE Grade 8 Science on Electricity..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#E8521A] transition-colors resize-none pr-10"
          />
          <button type="button" className="absolute right-3 bottom-3 text-gray-400 hover:text-[#E8521A] transition-colors">
            <Mic size={16} />
          </button>
        </div>
      </div>
    </form>
  );
}
