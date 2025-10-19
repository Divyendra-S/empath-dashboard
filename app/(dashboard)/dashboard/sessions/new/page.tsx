"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionForm } from "@/components/sessions/session-form";
import { themeConfig } from "@/lib/theme";

export default function NewSessionPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId") || undefined;

  return (
    <div className="space-y-8">
      <div
        className="rounded-3xl border bg-white/90 p-4 shadow-sm"
        style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
      >
        <Button
          variant="ghost"
          asChild
          className="group w-full max-w-2xl justify-start rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:text-[var(--theme-primary-hex)]"
        >
          <Link href="/dashboard/sessions">
            <ArrowLeft className="mr-2 h-4 w-4 transition group-hover:-translate-x-1" />
            Back to Sessions
          </Link>
        </Button>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl border p-6 shadow-sm"
        style={{
          borderColor: "rgba(120, 57, 238, 0.18)",
          background: themeConfig.gradients.panel,
        }}
      >
        <div
          className="absolute -top-24 right-0 h-44 w-44 rounded-full blur-3xl"
          style={{ background: themeConfig.colors.highlightStrong }}
        />
        <div
          className="absolute -bottom-24 left-0 h-52 w-52 rounded-full blur-3xl"
          style={{ background: themeConfig.colors.highlight }}
        />
        <div className="relative flex flex-col gap-3">
          <div
            className="inline-flex w-fit items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--theme-primary-hex)]/80"
            style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
          >
            Plan Ahead
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Schedule a new session
          </h1>
          <p className="text-sm text-slate-600">
            Map intentional touchpoints and keep every commitment visible.
          </p>
          <div
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-xl border bg-white/70 px-3 py-2 text-xs font-medium text-[var(--theme-primary-hex)] shadow-sm"
            style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
          >
            <Sparkles className="h-4 w-4 text-[var(--theme-primary-hex)]" /> Syncs with your calendar instantly
          </div>
        </div>
      </div>

      <div
        className="max-w-2xl rounded-3xl border bg-white/90 p-6 shadow-sm"
        style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
      >
        <SessionForm defaultClientId={clientId} />
      </div>
    </div>
  );
}
