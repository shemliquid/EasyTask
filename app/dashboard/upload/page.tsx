"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface UploadResult {
  processed: number;
  added: number;
  incremented: number;
  flagged: number;
  errors: { row: number; indexNumber: string; issue: string }[];
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please select a file.");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        setLoading(false);
        return;
      }
      setResult(data);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch {
      setError("Network error.");
    }
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Upload Excel
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Upload a .xlsx or .csv file with columns <strong>Index Number</strong> and optionally <strong>Student Name</strong>. Rows with issues are flagged; no data is discarded.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            File
          </label>
          <input
            ref={inputRef}
            id="file"
            type="file"
            accept=".xlsx,.csv"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setResult(null);
              setError("");
            }}
            className="mt-1.5 w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-medium file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-300"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !file}
          className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-zinc-800"
        >
          {loading ? "Uploading…" : "Upload"}
        </button>
      </form>

      {result && (
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
            Upload summary
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <li>Processed: {result.processed}</li>
            <li>Added to main records: {result.added}</li>
            <li>Assignment count incremented: {result.incremented}</li>
            <li>Flagged: {result.flagged}</li>
          </ul>
          {result.errors.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Flagged rows
              </h3>
              <ul className="mt-2 max-h-48 overflow-y-auto rounded border border-zinc-200 bg-zinc-50 p-2 text-xs dark:border-zinc-600 dark:bg-zinc-800">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    Row {e.row}: {e.indexNumber} – {e.issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
