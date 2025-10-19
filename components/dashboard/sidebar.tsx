"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  Calendar,
  Clock,
  Settings,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { themeConfig } from "@/lib/theme";
import { useLogout, useUser } from "@/lib/hooks/use-auth";

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { name: "Sessions", href: "/dashboard/sessions", icon: Clock },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mutate: logout, isPending } = useLogout();
  const { data: user } = useUser();

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ET";

  return (
    <aside
      className="flex h-full w-72 flex-col border-r"
      style={{
        borderColor: "rgba(120, 57, 238, 0.18)",
        background: themeConfig.gradients.sidebar,
      }}
    >
      <div className="px-5 pt-6">
        <div
          className="flex items-center justify-between rounded-2xl border bg-white/80 px-4 py-3 shadow-sm"
          style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--theme-primary-hex)]/75">
              Empath
            </p>
            <p className="text-lg font-semibold text-slate-900">Care Suite</p>
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg"
            style={{ background: themeConfig.gradients.icon }}
          >
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="px-5 pt-6">
        <Button
          className="w-full justify-center rounded-2xl text-sm font-semibold text-white shadow-lg transition"
          style={{
            backgroundColor: themeConfig.colors.primary,
            boxShadow: themeConfig.colors.shadowPrimary,
          }}
          onClick={() => {}}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      <div className="px-5 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search clients"
            className="h-11 rounded-xl border bg-white/80 pl-10 text-sm shadow-sm"
            style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
            onClick={() => router.push("/dashboard/clients")}
          />
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all",
                isActive
                  ? "bg-white text-[var(--theme-primary-hex)] shadow-sm"
                  : "border-transparent text-slate-600 hover:bg-white/70 hover:text-[var(--theme-primary-hex)]"
              )}
              style={{
                borderColor: isActive
                  ? "rgba(120, 57, 238, 0.24)"
                  : "transparent",
              }}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition",
                  isActive
                    ? "text-[var(--theme-primary-hex)]"
                    : "text-slate-400 group-hover:text-[var(--theme-primary-hex)]"
                )}
              />
              <span className={isActive ? "font-semibold" : ""}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-5 pb-6 pt-6">
        <div
          className="rounded-2xl border bg-white/80 p-4 shadow-sm"
          style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback
                className="rounded-xl text-xs font-semibold text-white"
                style={{ background: themeConfig.gradients.icon }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.fullName || "Therapist"}
              </p>
              <button
                onClick={() => logout()}
                disabled={isPending}
                className="mt-1 text-xs font-medium text-slate-500 transition hover:text-rose-500"
              >
                {isPending ? "Logging out..." : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
