"use client";

import { useState } from "react";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { themeConfig } from "@/lib/theme";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    
    try {
      const result = await login(formData);
      
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Logged in successfully");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-600">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
            disabled={isLoading}
            className="h-12 rounded-2xl border bg-white/85 px-4 text-sm shadow-sm"
            style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-slate-600">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            disabled={isLoading}
            className="h-12 rounded-2xl border bg-white/85 px-4 text-sm shadow-sm"
            style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 rounded border border-[rgba(120,57,238,0.24)]"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="font-medium text-[var(--theme-primary-hex)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button
          type="submit"
          className="h-12 w-full rounded-2xl text-sm font-semibold text-white shadow-lg"
          style={{
            backgroundColor: themeConfig.colors.primary,
            boxShadow: themeConfig.colors.shadowPrimary,
          }}
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Log in"}
        </Button>
      </form>
      <div className="rounded-2xl border border-dashed border-[rgba(120,57,238,0.2)] bg-[var(--theme-highlight)]/50 p-4 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-[var(--theme-primary-hex)]">
          Sign up for free
        </Link>
      </div>
    </div>
  );
}
