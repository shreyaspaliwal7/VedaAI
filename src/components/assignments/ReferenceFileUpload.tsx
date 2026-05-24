"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);
const ACCEPT_ATTR = "image/jpeg,image/png,.jpg,.jpeg,.png";

export interface UploadedReferenceFile {
  id: string;
  file: File;
  previewUrl: string;
}

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.has(file.type.toLowerCase())) {
    return "Only JPEG and PNG files are allowed.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "File must be 10MB or smaller.";
  }
  return null;
}

interface ReferenceFileUploadProps {
  files: UploadedReferenceFile[];
  onChange: (files: UploadedReferenceFile[]) => void;
  onValidationError?: (messages: string[]) => void;
}

export default function ReferenceFileUpload({
  files,
  onChange,
  onValidationError,
}: ReferenceFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const errors: string[] = [];
      const added: UploadedReferenceFile[] = [];

      Array.from(incoming).forEach((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(`${file.name}: ${validationError}`);
          return;
        }
        added.push({
          id: uuidv4(),
          file,
          previewUrl: URL.createObjectURL(file),
        });
      });

      if (errors.length > 0) {
        onValidationError?.(errors);
      }
      if (added.length > 0) {
        onChange([...files, ...added]);
      }
    },
    [files, onChange, onValidationError]
  );

  const removeFile = useCallback(
    (id: string) => {
      const target = files.find((f) => f.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      onChange(files.filter((f) => f.id !== id));
    },
    [files, onChange]
  );

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            addFiles(e.target.files);
          }
          e.target.value = "";
        }}
      />

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openFilePicker();
          }
        }}
        onClick={openFilePicker}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-1.5 transition-colors cursor-pointer ${
          dragging
            ? "border-[#E8521A] bg-orange-50/50"
            : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        <Upload size={24} className="text-gray-400 mb-1" />
        <p className="text-xs font-semibold text-gray-800">
          Choose a file or drag & drop it here
        </p>
        <p className="text-[10px] text-gray-400">JPEG, PNG, up to 10MB</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openFilePicker();
          }}
          className="mt-2 px-5 py-2 border border-gray-100 bg-[#F4F4F4] rounded-full text-[10px] font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Browse Files
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center -mt-1 font-medium">
        Upload images of your preferred document/image
      </p>

      {files.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {files.map((item) => (
            <li
              key={item.id}
              className="relative rounded-xl border border-gray-200 bg-white overflow-hidden group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.previewUrl}
                alt={item.file.name}
                className="w-full h-24 object-cover"
              />
              <div className="px-2 py-1.5">
                <p className="text-xs text-gray-700 truncate" title={item.file.name}>
                  {item.file.name}
                </p>
                <p className="text-[10px] text-gray-400">
                  {(item.file.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(item.id)}
                aria-label={`Remove ${item.file.name}`}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function revokeReferenceFileUrls(files: UploadedReferenceFile[]): void {
  files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
}

export function buildReferenceFilesNote(files: UploadedReferenceFile[]): string {
  if (files.length === 0) return "";
  const names = files.map((f) => f.file.name).join(", ");
  return `\n\nReference image(s) uploaded by teacher: ${names}. Use these as style/content guidance when generating questions.`;
}
