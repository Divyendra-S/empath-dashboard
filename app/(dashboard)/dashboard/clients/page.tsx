"use client";

import { useState } from "react";
import Link from "next/link";
import { NotebookPen, Plus, Sparkles, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClients } from "@/lib/hooks/use-clients";
import { ClientCard } from "@/components/clients/client-card";
import { ClientSearch } from "@/components/clients/client-search";
import { themeConfig } from "@/lib/theme";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const { data: clients, isLoading, error } = useClients(search);

  return (
    <div className="space-y-8">
      <div
        className="relative overflow-hidden rounded-3xl border p-6 shadow-sm"
        style={{
          borderColor: "rgba(120, 57, 238, 0.18)",
          background: themeConfig.gradients.panel,
        }}
      >
        <div
          className="absolute -top-20 right-0 h-40 w-40 rounded-full blur-3xl"
          style={{ background: themeConfig.colors.highlightStrong }}
        />
        <div
          className="absolute -bottom-24 left-2 h-48 w-48 rounded-full blur-3xl"
          style={{ background: themeConfig.colors.highlight }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--theme-primary-hex)]/80"
              style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
            >
              <UsersRound className="h-3.5 w-3.5 text-[var(--theme-primary-hex)]" />
              Clients
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">
              Nurture lasting connections
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Organize client stories and tailor support with confidence.
            </p>
            
          </div>
          <div className="flex flex-col items-end gap-3">
            <Button
              asChild
              className="rounded-2xl text-sm font-semibold text-white shadow-lg transition"
              style={{
                backgroundColor: themeConfig.colors.primary,
                boxShadow: themeConfig.colors.shadowPrimary,
              }}
            >
              <Link href="/dashboard/clients/new">
                <Plus className="mr-2 h-4 w-4" />
                New Client
              </Link>
            </Button>
            <div
              className="rounded-xl border bg-white/70 px-4 py-2 text-xs font-medium text-[var(--theme-primary-hex)] shadow-sm"
              style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
            >
              <Sparkles className="mr-1 inline h-4 w-4 text-[var(--theme-primary-hex)]" /> Thoughtful care starts here
            </div>
          </div>
        </div>
      </div>

      <div
        className="rounded-3xl border bg-white/85 p-6 shadow-sm"
        style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
      >
        <div className="flex items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            <NotebookPen className="h-4 w-4 text-[var(--theme-primary-hex)]" />
            Client Lookup
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden rounded-xl text-xs font-medium text-slate-600 hover:text-[var(--theme-primary-hex)] md:flex"
            style={{ borderRadius: "0.75rem" }}
          >
            <Link href="/dashboard/clients/new">
              <Plus className="mr-2 h-4 w-4" /> Add Client
            </Link>
          </Button>
        </div>
        <ClientSearch value={search} onChange={setSearch} />
      </div>

      <div
        className="rounded-3xl border bg-white/90 p-6 shadow-sm"
        style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
      >
        {error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/70 py-12 text-center">
            <p className="text-sm font-semibold text-rose-500">
              Error loading clients
            </p>
            <p className="mt-2 text-xs text-rose-400">{error.message}</p>
          </div>
        ) : isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : clients && clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[rgba(120,57,238,0.32)] bg-[var(--theme-highlight)] p-12 text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              No clients yet
            </h3>
            <p className="text-sm text-slate-500">
              Start building trusted relationships by adding your first client.
            </p>
            <Button
              asChild
              className="rounded-xl text-sm font-semibold text-white shadow-lg transition"
              style={{
                backgroundColor: themeConfig.colors.primary,
                boxShadow: themeConfig.colors.shadowPrimary,
              }}
            >
              <Link href="/dashboard/clients/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clients?.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
