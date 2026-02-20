"use client";

import { useState } from "react";
import { Modal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";

interface LookupLinkGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LookupLinkGenerator({ isOpen, onClose, onSuccess }: LookupLinkGeneratorProps) {
  const [duration, setDuration] = useState<number>(24);
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<{
    url: string;
    expiresAt: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/lookup-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationHours: duration }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate link");
      }

      const data = await res.json();
      setGeneratedLink({
        url: data.url,
        expiresAt: data.expiresAt,
      });
      toast.success("Lookup link generated successfully!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedLink) return;

    try {
      await navigator.clipboard.writeText(generatedLink.url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleClose = () => {
    setGeneratedLink(null);
    setDuration(24);
    setCopied(false);
    onClose();
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <ModalHeader onClose={handleClose}>
        {generatedLink ? "Link Generated Successfully!" : "Generate Lookup Link"}
      </ModalHeader>

      {!generatedLink ? (
        <>
          <ModalContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="duration">Link Duration</Label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="mt-1 flex h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  disabled={loading}
                >
                  <option value={1}>1 hour</option>
                  <option value={3}>3 hours</option>
                  <option value={6}>6 hours</option>
                  <option value={12}>12 hours</option>
                  <option value={24}>24 hours (1 day)</option>
                  <option value={48}>48 hours (2 days)</option>
                </select>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Students will be able to use this link to look up their assignment records
                for the selected duration.
              </p>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? "Generating..." : "Generate Link"}
            </Button>
          </ModalFooter>
        </>
      ) : (
        <>
          <ModalContent>
            <div className="space-y-4">
              <div>
                <Label>Share this link with students:</Label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedLink.url}
                    readOnly
                    className="flex h-10 flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                  />
                  <Button
                    size="sm"
                    onClick={handleCopy}
                    className="shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Expires: {formatExpiryDate(generatedLink.expiresAt)}
                </p>
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button onClick={handleClose}>Done</Button>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
}
