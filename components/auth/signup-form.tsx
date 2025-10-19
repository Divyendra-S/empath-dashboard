"use client";

import { useState } from "react";
import { signUp } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { themeConfig } from "@/lib/theme";

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    // Basic validation
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp(formData);

      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
      } else if (result?.message) {
        // Email confirmation required
        toast.success(result.message);
        setIsLoading(false);
      } else {
        // Success - redirecting to dashboard
        toast.success("Account created successfully! Redirecting...");
        // Don't set loading to false here as we're redirecting
      }
    } catch (error) {
      // Catch any unexpected errors
      console.error("Signup error:", error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-sm font-medium text-slate-600">
            Full name
          </Label>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            placeholder="Dr. John Doe"
            required
            disabled={isLoading}
            className="h-12 rounded-2xl border bg-white/85 px-4 text-sm shadow-sm"
            style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
          />
        </div>
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
        <div className="space-y-2">
          <Label htmlFor="confirm_password" className="text-sm font-medium text-slate-600">
            Confirm password
          </Label>
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            required
            disabled={isLoading}
            className="h-12 rounded-2xl border bg-white/85 px-4 text-sm shadow-sm"
            style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
          />
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
          {isLoading ? "Creating account..." : "Sign up"}
        </Button>
      </form>
      <div className="rounded-2xl border border-dashed border-[rgba(120,57,238,0.2)] bg-[var(--theme-highlight)]/50 p-4 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[var(--theme-primary-hex)]">
          Log in
        </Link>
      </div>
    </div>
  );
}
