"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FlaggedRecord {
  id: string;
  indexNumber: string;
  name: string | null;
  issueType: string;
  source: string;
  assignmentCount: number;
}

export function FlaggedTable({ records }: { records: FlaggedRecord[] }) {
  const [resolving, setResolving] = useState<string | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const router = useRouter();

  async function resolve(id: string, action: "approve" | "edit") {
    setResolving(id);
    setError("");
    const name = names[id]?.trim();
    try {
      const res = await fetch(`/api/flagged/${id}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ...(action === "edit" || action === "approve" ? { name: name || undefined } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to resolve.");
        setResolving(null);
        return;
      }
      setNames((prev) => ({ ...prev, [id]: "" }));
      setResolving(null);
      router.refresh();
    } catch {
      setError("Network error.");
      setResolving(null);
    }
  }

  if (records.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-8 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
        No flagged records.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-amber-50/50 dark:border-zinc-700 dark:bg-amber-900/10">
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                  Index number
                </th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                  Name
                </th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                  Issue
                </th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                  Source
                </th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                  Count
                </th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-700/50"
                >
                  <td className="px-4 py-3 font-mono text-zinc-900 dark:text-zinc-100">
                    {r.indexNumber}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {r.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                      {r.issueType.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {r.source}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {r.assignmentCount}
                  </td>
                  <td className="px-4 py-3">
                    {resolving === r.id ? (
                      <span className="text-zinc-500">Resolving…</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          placeholder="Name (optional)"
                          value={names[r.id] ?? ""}
                          onChange={(e) =>
                            setNames((prev) => ({ ...prev, [r.id]: e.target.value }))
                          }
                          className="w-32 rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                        />
                        <button
                          type="button"
                          onClick={() => resolve(r.id, "approve")}
                          className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => resolve(r.id, "edit")}
                          className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Edit & add
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
