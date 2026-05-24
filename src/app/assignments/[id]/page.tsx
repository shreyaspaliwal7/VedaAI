"use client";

import { useCallback, useEffect, useState } from "react";
import { useAssignmentStore } from "@/store/assignmentStore";
import { useNotificationStore } from "@/store/notificationStore";
import {
  fetchAssignment,
  getApiBaseUrl,
  regenerateAssignment as regenerateAssignmentApi,
  publishAssignment as publishAssignmentApi,
} from "@/lib/api";
import { useAssignmentSocket } from "@/hooks/useAssignmentSocket";
import {
  GeneratedPaper,
  PaperSection,
  Question,
  AnswerItem,
  GenerationStatus,
} from "@/types";
import { Download, Loader2, RefreshCw, CloudUpload } from "lucide-react";
import MobileHeader from "@/components/layout/MobileHeader";

export default function AssignmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { getAssignment, syncFromApi, updateAssignment, publishAssignment } = useAssignmentStore();
  const assignment = getAssignment(id);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Notifications
  const { addNotification } = useNotificationStore();

  // Modal states
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [regenInstructions, setRegenInstructions] = useState("");
  const [isRegeneratingLocal, setIsRegeneratingLocal] = useState(false);
  const [isPublishingLocal, setIsPublishingLocal] = useState(false);

  // Transition listener for background updates
  const [prevStatus, setPrevStatus] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generationStatus: GenerationStatus =
    assignment?.generationStatus ?? "PENDING";

  const loadAssignment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fetchAssignment(id);
      syncFromApi(data);
    } catch {
      setFetchError(
        "Could not load assignment. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, [id, syncFromApi]);

  useEffect(() => {
    loadAssignment();
  }, [loadAssignment]);

  useEffect(() => {
    if (
      !id ||
      generationStatus === "COMPLETED" ||
      generationStatus === "FAILED"
    ) {
      return;
    }
    const interval = setInterval(() => {
      loadAssignment();
    }, 3000);
    return () => clearInterval(interval);
  }, [id, generationStatus, loadAssignment]);

  // Dynamic notification on background completion / fail
  useEffect(() => {
    if (generationStatus && prevStatus && prevStatus !== generationStatus) {
      if (prevStatus === "PROCESSING" || prevStatus === "PENDING") {
        if (generationStatus === "COMPLETED") {
          addNotification(
            "Draft Ready",
            `The exam paper draft for "${assignment?.title}" is ready for your review.`,
            "assignment",
            `/assignments/${id}`
          );
        } else if (generationStatus === "FAILED") {
          addNotification(
            "Generation Failed",
            `Could not generate question paper for "${assignment?.title}".`,
            "general",
            `/assignments/${id}`
          );
        }
      }
    }
    setPrevStatus(generationStatus);
  }, [generationStatus, prevStatus, assignment?.title, addNotification, id]);

  const handleStatusChange = useCallback(
    (status: GenerationStatus, error?: string) => {
      updateAssignment(id, {
        generationStatus: status,
        errorMessage: error,
      });
      if (status === "COMPLETED" || status === "FAILED") {
        loadAssignment();
      }
    },
    [id, updateAssignment, loadAssignment]
  );

  useAssignmentSocket({
    assignmentId: id,
    enabled:
      Boolean(id) &&
      generationStatus !== "COMPLETED" &&
      generationStatus !== "FAILED",
    onStatusChange: handleStatusChange,
  });

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.open(`${getApiBaseUrl()}/api/assignments/${id}/pdf`, "_blank");
    }
  };

  const handlePublish = async () => {
    if (!id || !assignment) return;
    setIsPublishingLocal(true);
    try {
      await publishAssignmentApi(id);
      publishAssignment(id);

      addNotification(
        "Assignment Uploaded Successfully",
        `"${assignment.title}" has been uploaded to the server (Deadline: ${assignment.dueDate || "None"}).`,
        "assignment",
        `/assignments/${id}`
      );
    } catch (err) {
      console.error(err);
      alert("Failed to upload assignment to the server.");
    } finally {
      setIsPublishingLocal(false);
    }
  };

  const handleRegenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !assignment) return;
    setIsRegeneratingLocal(true);
    try {
      const combinedNotes = regenInstructions.trim()
        ? `${assignment.additionalInfo || ""}\n[Regeneration Guidance]: ${regenInstructions.trim()}`.trim()
        : assignment.additionalInfo;

      await regenerateAssignmentApi(id, combinedNotes);

      updateAssignment(id, {
        generationStatus: "PENDING",
        additionalInfo: combinedNotes,
        generatedPaper: undefined,
        errorMessage: undefined,
      });

      addNotification(
        "Regeneration Started",
        `Regenerating paper draft for "${assignment.title}" with updated notes.`,
        "general",
        `/assignments/${id}`
      );

      setShowRegenModal(false);
      setRegenInstructions("");
      loadAssignment();
    } catch (err) {
      console.error(err);
      alert("Failed to request paper regeneration.");
    } finally {
      setIsRegeneratingLocal(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
        <Loader2 className="animate-spin" size={28} />
        <p className="text-sm">Loading assignment…</p>
      </div>
    );
  }

  if (loading && !assignment) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
        <Loader2 className="animate-spin" size={28} />
        <p className="text-sm">Loading assignment…</p>
      </div>
    );
  }

  if (fetchError && !assignment) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm px-4 text-center">
        {fetchError}
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Assignment not found.
      </div>
    );
  }

  const paper = assignment.generatedPaper;
  const isGenerating =
    generationStatus === "PENDING" || generationStatus === "PROCESSING";
  const isFailed = generationStatus === "FAILED";

  return (
    <>
      {/* Mobile */}
      <div
        className="md:hidden bg-gray-50 min-h-full print:bg-white pb-20"
        suppressHydrationWarning
      >
        <div className="print:hidden">
          <MobileHeader showBack />
        </div>

        {isGenerating && <GeneratingBanner status={generationStatus} />}

        {isFailed && (
          <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 print:hidden">
            {assignment.errorMessage ??
              "Generation failed. Please try creating a new assignment."}
          </div>
        )}

        {paper && (
          <div className="bg-gray-800 mx-4 mt-4 rounded-2xl p-4 mb-4 print:hidden">
            {assignment.status === "draft" ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 bg-orange-500/20 text-[#FF7A45] text-[9px] font-bold rounded-full uppercase tracking-wider">
                    Draft Preview
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">Not uploaded yet</span>
                </div>
                <p className="text-white text-xs leading-relaxed mb-4">
                  Review this question paper draft. If you don't like the questions, you can regenerate them.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRegenModal(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-white/20 hover:border-white/40 text-white rounded-full py-2 text-xs font-medium transition-colors"
                  >
                    <RefreshCw size={12} />
                    Regenerate
                  </button>
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isPublishingLocal}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#E8521A] hover:bg-[#cf4210] text-white rounded-full py-2 text-xs font-bold transition-colors disabled:opacity-60"
                  >
                    {isPublishingLocal ? (
                      <Loader2 className="animate-spin" size={12} />
                    ) : (
                      <CloudUpload size={12} />
                    )}
                    Upload
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 bg-green-500/20 text-[#52C41A] text-[9px] font-bold rounded-full uppercase tracking-wider">
                    Uploaded & Active
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">Ready to print</span>
                </div>
                <p className="text-white text-xs leading-relaxed mb-3">
                  This question paper is live. Download or print for your class.
                </p>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-1.5 bg-white text-gray-800 rounded-full py-2 px-4 text-xs font-bold w-full transition-colors"
                >
                  <Download size={12} />
                  Download PDF
                </button>
              </>
            )}
          </div>
        )}

        {paper && <PaperBody paper={paper} />}
        {!paper && !isGenerating && !isFailed && <EmptyPaperState />}
      </div>

      {/* Desktop */}
      <div
        className="hidden md:block animate-fade-in print:block"
        suppressHydrationWarning
      >
        {isGenerating && <GeneratingBanner status={generationStatus} />}

        {isFailed && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-5 print:hidden">
            {assignment.errorMessage ?? "Generation failed."}
          </div>
        )}

        {paper && (
          <div className="bg-gray-800 rounded-2xl p-5 mb-5 print:hidden">
            {assignment.status === "draft" ? (
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-orange-500/20 text-[#FF7A45] text-[9px] font-bold rounded-full uppercase tracking-wider">
                      Draft Preview
                    </span>
                    <p className="text-white text-sm font-semibold">Review and Finalize Paper</p>
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    This is an AI-generated draft question paper. If you want to change the questions, click Regenerate. Once satisfied, click Upload to Server to publish.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowRegenModal(true)}
                    className="flex items-center gap-1.5 border border-white/20 hover:border-white/40 text-white rounded-full px-4 py-2 text-xs font-semibold hover:bg-white/5 transition-colors"
                  >
                    <RefreshCw size={12} />
                    Regenerate Paper
                  </button>
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isPublishingLocal}
                    className="flex items-center gap-1.5 bg-[#E8521A] hover:bg-[#cf4210] text-white rounded-full px-5 py-2 text-xs font-bold hover:shadow-lg transition-all disabled:opacity-60"
                  >
                    {isPublishingLocal ? (
                      <Loader2 className="animate-spin" size={12} />
                    ) : (
                      <CloudUpload size={12} />
                    )}
                    Upload to Server
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-green-500/20 text-[#52C41A] text-[9px] font-bold rounded-full uppercase tracking-wider">
                      Uploaded & Active
                    </span>
                    <p className="text-white text-sm font-semibold">Paper Live & Ready</p>
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    This exam paper has been uploaded and finalized on the server. You can download or print the official PDF version for your class.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-white text-gray-800 rounded-full px-5 py-2.5 text-xs font-bold whitespace-nowrap shrink-0 hover:bg-gray-100 transition-colors"
                >
                  <Download size={14} />
                  Download as PDF
                </button>
              </div>
            )}
          </div>
        )}

        {paper && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-3xl print:max-w-none print:border-0 print:shadow-none print:p-0 print:rounded-none">
            <PaperBody paper={paper} />
          </div>
        )}

        {!paper && !isGenerating && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
            <EmptyPaperState />
          </div>
        )}
      </div>

      {/* Regeneration Modal */}
      {showRegenModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-2">Regenerate Question Paper</h3>
            <p className="text-xs text-gray-500 mb-4">
              Add any additional constraints, topics, or difficulty guidance for the AI. Leave blank to regenerate with the same constraints.
            </p>
            <form onSubmit={handleRegenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Additional Instructions
                </label>
                <textarea
                  value={regenInstructions}
                  onChange={(e) => setRegenInstructions(e.target.value)}
                  placeholder="e.g. Focus more on basic algebra, reduce geometry questions, make Section B more challenging..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#E8521A] transition-colors resize-none text-gray-800"
                />
              </div>
              <div className="flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegenModal(false);
                    setRegenInstructions("");
                  }}
                  disabled={isRegeneratingLocal}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRegeneratingLocal}
                  className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-gray-800 text-white rounded-full px-5 py-2 text-xs font-semibold transition-all disabled:opacity-60"
                >
                  {isRegeneratingLocal ? (
                    <>
                      <Loader2 className="animate-spin" size={12} />
                      Regenerating...
                    </>
                  ) : (
                    "Regenerate"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function GeneratingBanner({ status }: { status: GenerationStatus }) {
  return (
    <div className="mx-4 md:mx-0 mt-4 md:mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-4 flex items-center gap-3 print:hidden animate-pulse">
      <Loader2 className="animate-spin text-blue-600 shrink-0" size={20} />
      <div>
        <p className="text-sm font-medium text-blue-900">
          {status === "PENDING"
            ? "Queued for generation…"
            : "Generating your question paper…"}
        </p>
        <p className="text-xs text-blue-700 mt-0.5">
          This page updates automatically when ready.
        </p>
      </div>
    </div>
  );
}

function EmptyPaperState() {
  return <p>No question paper generated yet.</p>;
}

function PaperBody({ paper }: { paper: GeneratedPaper }) {
  return (
    <div
      id="exam-paper-print"
      className="paper-body px-4 md:px-0 pb-8 print:px-0 print:pb-0 print:text-black"
    >
      <div className="text-center mb-6 print:mb-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1 print:text-lg">
          {paper.schoolName}
        </h1>
        <p className="text-sm text-gray-700">Subject: {paper.subject}</p>
        <p className="text-sm text-gray-700">Class: {paper.className}</p>
      </div>

      <div className="flex justify-between text-sm text-gray-700 mb-3 border-b border-gray-200 pb-3 print:mb-2">
        <span>Time Allowed: {paper.timeAllowed}</span>
        <span>Maximum Marks: {paper.maxMarks}</span>
      </div>

      <p className="text-sm text-gray-700 italic mb-4 print:mb-3">
        All questions are compulsory unless stated otherwise.
      </p>

      <div className="space-y-1.5 mb-6 text-sm text-gray-700 print:mb-4">
        <div>
          Name:{" "}
          <span className="inline-block border-b border-gray-400 w-48 ml-1 print:w-56" />
        </div>
        <div>
          Roll Number:{" "}
          <span className="inline-block border-b border-gray-400 w-36 ml-1 print:w-40" />
        </div>
        <div>
          Class: {paper.className} Section:{" "}
          <span className="inline-block border-b border-gray-400 w-24 ml-1 print:w-28" />
        </div>
      </div>

      {paper.sections.map((section: PaperSection, si: number) => (
        <div key={si} className="mb-6 print:mb-4 break-inside-avoid">
          <h2 className="text-center font-bold text-gray-900 mb-2 text-base">
            {section.title}
          </h2>
          <div className="mb-3">
            {section.instructions
              .split("\n")
              .map((line: string, li: number) => (
                <p
                  key={li}
                  className={`text-sm text-gray-700 ${
                    li === 0 ? "font-semibold" : ""
                  }`}
                >
                  {line}
                </p>
              ))}
          </div>
          <ol className="space-y-2 list-none">
            {section.questions.map((q: Question) => (
              <li
                key={q.number}
                className="text-sm text-gray-700 leading-relaxed break-inside-avoid"
              >
                <span className="font-medium">{q.number}.</span>{" "}
                <span className="text-gray-500 text-xs print:text-gray-600">
                  [{q.difficulty}]
                </span>{" "}
                {q.text}{" "}
                <span className="text-gray-500">[{q.marks} Marks]</span>
              </li>
            ))}
          </ol>
        </div>
      ))}

      <p className="mt-4 font-bold text-sm text-gray-800 text-center print:mt-6">
        End of Question Paper
      </p>

      {paper.answerKey.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-5 print:break-before-page print:mt-8">
          <h3 className="font-bold text-gray-900 text-base mb-3">
            Answer Key:
          </h3>
          <ol className="space-y-3 list-none">
            {paper.answerKey.map((a: AnswerItem) => (
              <li
                key={a.number}
                className="text-sm text-gray-700 leading-relaxed"
              >
                <span className="font-medium">{a.number}.</span> {a.answer}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}