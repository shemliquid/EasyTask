"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, AlertCircle, CheckCircle } from "lucide-react";

export default function LookupPage() {
  const params = useParams();
  const token = params.token as string;

  const [indexNumber, setIndexNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    indexNumber: string;
    name: string | null;
    assignmentCount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // Validate token on mount (simple check by trying a dummy lookup)
  useEffect(() => {
    // We don't validate the token upfront to avoid revealing its validity
    // Token will be validated when user attempts a lookup
    setTokenValid(true);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indexNumber.trim()) {
      setError("Please enter an index number");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          indexNumber: indexNumber.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setError("This lookup link is invalid or has expired. Please contact your lecturer.");
          setTokenValid(false);
        } else if (res.status === 404) {
          setError("No record found for this index number.");
        } else if (res.status === 429) {
          setError("Too many requests. Please try again in a minute.");
        } else {
          setError(data.error || "An error occurred");
        }
        return;
      }

      setResult(data);
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 px-4 dark:from-neutral-900 dark:to-neutral-950">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                EasyTask
              </h1>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                View Your Assignment Records
              </p>
            </div>

            {/* Invalid token state */}
            {tokenValid === false && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-950/20">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                  <div>
                    <h3 className="font-medium text-red-900 dark:text-red-300">
                      Link Expired or Invalid
                    </h3>
                    <p className="mt-1 text-sm text-red-800 dark:text-red-400">
                      This lookup link is no longer valid. Please contact your lecturer for a new link.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Search form */}
            {tokenValid !== false && (
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <Label htmlFor="indexNumber">Index Number</Label>
                  <div className="relative mt-1">
                    <Input
                      id="indexNumber"
                      type="text"
                      placeholder="e.g., 2023001"
                      value={indexNumber}
                      onChange={(e) => setIndexNumber(e.target.value)}
                      disabled={loading}
                      className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !indexNumber.trim()}
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </form>
            )}

            {/* Error message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-950/20">
                <p className="text-sm font-medium text-red-800 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900/30 dark:bg-green-950/20">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm font-medium text-green-900 dark:text-green-300">
                    Record Found
                  </p>
                </div>

                <div className="space-y-3 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900">
                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Index Number
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {result.indexNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Student Name
                    </p>
                    <p className="mt-1 text-base text-neutral-900 dark:text-neutral-100">
                      {result.name || (
                        <span className="italic text-neutral-400 dark:text-neutral-500">
                          No name on record
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Assignments Completed
                    </p>
                    <p className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {result.assignmentCount}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
