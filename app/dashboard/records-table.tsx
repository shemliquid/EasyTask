"use client";

interface Student {
  id: string;
  indexNumber: string;
  name: string | null;
  assignmentCount: number;
}

export function RecordsTable({ students }: { students: Student[] }) {
  if (students.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-8 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
        No student records yet. Add assignments manually or upload an Excel file.
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/80">
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Index number
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Student name
              </th>
              <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                Assignment count
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr
                key={s.id}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-700/50"
              >
                <td className="px-4 py-3 font-mono text-zinc-900 dark:text-zinc-100">
                  {s.indexNumber}
                </td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {s.name ?? "—"}
                </td>
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  {s.assignmentCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
