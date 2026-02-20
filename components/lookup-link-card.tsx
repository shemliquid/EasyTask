"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface LookupLinkCardProps {
  link: {
    id: string;
    token: string;
    active: boolean;
    expiresAt: string;
    createdAt: string;
    status: "active" | "expired" | "inactive";
  };
  onUpdate: () => void;
}

export function LookupLinkCard({ link, onUpdate }: LookupLinkCardProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const linkUrl = `${window.location.origin}/lookup/${link.token}`;
  const expiresAt = new Date(link.expiresAt);
  const createdAt = new Date(link.createdAt);
  const now = new Date();
  const isExpired = expiresAt < now;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(linkUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleToggleActive = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lookup-links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !link.active }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update link");
      }

      toast.success(link.active ? "Link deactivated" : "Link reactivated");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this link? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/lookup-links/${link.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete link");
      }

      toast.success("Link deleted successfully");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
          🔴 Expired
        </span>
      );
    }
    if (!link.active) {
      return (
        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400">
          ⚫ Inactive
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
        🟢 Active
      </span>
    );
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Status and timestamps */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {getStatusBadge()}
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Created {formatDistanceToNow(createdAt, { addSuffix: true })}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {isExpired
                  ? `Expired ${formatDistanceToNow(expiresAt, { addSuffix: true })}`
                  : `Expires ${formatDistanceToNow(expiresAt, { addSuffix: true })}`}
              </p>
            </div>
          </div>

          {/* Link URL (only show for active links) */}
          {!isExpired && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={linkUrl}
                readOnly
                className="flex h-9 flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                disabled={loading}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isExpired && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleToggleActive}
                disabled={loading}
                className="flex-1"
              >
                <Power className="mr-2 h-4 w-4" />
                {link.active ? "Deactivate" : "Reactivate"}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              disabled={loading}
              className={`${isExpired ? "flex-1" : ""}text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300`}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
