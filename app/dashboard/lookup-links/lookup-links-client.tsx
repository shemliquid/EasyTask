"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LookupLinkGenerator } from "@/components/lookup-link-generator";
import { LookupLinkCard } from "@/components/lookup-link-card";
import { Plus, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface LookupLink {
  id: string;
  token: string;
  active: boolean;
  expiresAt: string;
  createdAt: string;
  status: "active" | "expired" | "inactive";
  isExpired: boolean;
}

export function LookupLinksClient() {
  const [links, setLinks] = useState<LookupLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);

  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/lookup-links");
      if (!res.ok) {
        throw new Error("Failed to fetch links");
      }
      const data = await res.json();
      setLinks(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const activeLinks = links.filter((link) => !link.isExpired && link.active);
  const inactiveLinks = links.filter((link) => !link.isExpired && !link.active);
  const expiredLinks = links.filter((link) => link.isExpired);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Student Lookup Links
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Generate shareable links for students to view their assignment records.
        </p>
      </div>

      {/* Generate button */}
      <div>
        <Button onClick={() => setShowGenerator(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Generate New Link
        </Button>
      </div>

      {/* No links state */}
      {links.length === 0 && (
        <Card className="p-12 text-center">
          <div className="mx-auto max-w-sm space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <LinkIcon className="h-6 w-6 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              No lookup links yet
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Create your first lookup link to allow students to view their records.
            </p>
          </div>
        </Card>
      )}

      {/* Active links */}
      {activeLinks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Active Links ({activeLinks.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeLinks.map((link) => (
              <LookupLinkCard key={link.id} link={link} onUpdate={fetchLinks} />
            ))}
          </div>
        </div>
      )}

      {/* Inactive links */}
      {inactiveLinks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Inactive Links ({inactiveLinks.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {inactiveLinks.map((link) => (
              <LookupLinkCard key={link.id} link={link} onUpdate={fetchLinks} />
            ))}
          </div>
        </div>
      )}

      {/* Expired links */}
      {expiredLinks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Expired Links ({expiredLinks.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {expiredLinks.map((link) => (
              <LookupLinkCard key={link.id} link={link} onUpdate={fetchLinks} />
            ))}
          </div>
        </div>
      )}

      {/* Generator modal */}
      <LookupLinkGenerator
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        onSuccess={fetchLinks}
      />
    </div>
  );
}
