"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EntryPage() {
  const [indexNumber, setIndexNumber] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indexNumber: indexNumber.trim(),
          name: name.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Failed to add assignment", {
          description:
            data.error ?? "An error occurred while processing your request.",
        });
        setLoading(false);
        return;
      }

      toast.success("Assignment added successfully", {
        description: data.message,
      });

      setIndexNumber("");
      setName("");
      router.refresh();

      // Auto-focus index number input for quick consecutive entries
      document.getElementById("indexNumber")?.focus();
    } catch {
      toast.error("Network error", {
        description: "Could not connect to the server. Please try again.",
      });
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Add Assignment
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Record assignment completion for a student. Enter their index number
          and optional name.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>
            Existing students will have their assignment count incremented. New
            students without a name will be flagged for review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="indexNumber">
                Index Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="indexNumber"
                type="text"
                placeholder="e.g., 12345678"
                value={indexNumber}
                onChange={(e) => setIndexNumber(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                The unique identifier for the student
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Student Name (Optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Recommended - students without names will be flagged for review
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading} disabled={loading}>
                Add Assignment
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIndexNumber("");
                  setName("");
                }}
                disabled={loading || (!indexNumber && !name)}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-2xl border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium">Tip: Quick Entry</p>
              <p className="mt-1 text-blue-700 dark:text-blue-200">
                After submitting, the form will automatically clear and focus
                the index number field for rapid consecutive entries.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
