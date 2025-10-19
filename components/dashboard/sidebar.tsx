"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Calendar, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/lib/hooks/use-auth";

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Sessions", href: "/dashboard/sessions", icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  const { mutate: logout, isPending } = useLogout();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold">Empath</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-800 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white"
          onClick={() => logout()}
          disabled={isPending}
        >
          <LogOut className="mr-3 h-5 w-5" />
          {isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  );
}
