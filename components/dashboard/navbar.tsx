"use client";

import { UserNav } from "./user-nav";

export function Navbar() {
  return (
    <div className="border-b bg-white">
      <div className="flex h-16 items-center justify-end px-6">
        <UserNav />
      </div>
    </div>
  );
}
