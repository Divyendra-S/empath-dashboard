"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, Calendar, Clock, Settings, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
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
    <div className="flex h-full w-64 flex-col border-r bg-white" style={{ borderColor: 'rgb(237 233 254)' }}>
      {/* Logo */}
      <div className="flex h-14 items-center px-4 border-b" style={{ borderColor: 'rgb(237 233 254)' }}>
        <h1 className="text-lg font-bold" style={{ color: '#7839EE' }}>
          Empath
        </h1>
      </div>

      {/* New Note Button */}
      <div className="p-4">
        <Button 
          className="w-full text-white shadow-sm hover:opacity-90"
          style={{ backgroundColor: '#7839EE' }}
          onClick={() => {}}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      {/* Search Clients */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search all clients..."
            className="pl-9 bg-purple-50/30"
            style={{ borderColor: 'rgb(240 237 255)' }}
            onClick={() => router.push("/dashboard/clients")}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "shadow-sm"
                  : "text-gray-700 hover:bg-purple-50/50"
              )}
              style={isActive ? { backgroundColor: '#f6f4ff', color: '#7839EE' } : {}}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "" : "text-gray-400"
                )}
                style={isActive ? { color: '#7839EE' } : {}}
              />
              <span className={isActive ? "font-semibold" : ""}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile at Bottom */}
      <div className="p-4 border-t" style={{ borderColor: 'rgb(237 233 254)' }}>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-white text-xs font-semibold" style={{ backgroundColor: '#7839EE' }}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.fullName || "Therapist"}
            </p>
            <button
              onClick={() => logout()}
              disabled={isPending}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors"
            >
              {isPending ? "Logging out..." : "Sign out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
