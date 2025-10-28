"use server";

import { createServerClientA as createSupabaseClient } from "@/lib/supabase/server-a";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const supabase = await createSupabaseClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    // Check if email confirmation is required
    if (data?.user && !data.session) {
      return {
        success: true,
        message:
          "Account created! Please check your email to confirm your account before logging in.",
      };
    }

    // Profile is automatically created by database trigger
    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch (error) {
    // If it's a redirect, let it through
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    // Otherwise return the error
    return { error: "Failed to create account. Please try again." };
  }
}

export async function login(formData: FormData) {
  const supabase = await createSupabaseClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch (error) {
    // If it's a redirect, let it through
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    // Otherwise return the error
    return { error: "Failed to log in. Please try again." };
  }
}

export async function logout() {
  const supabase = await createSupabaseClient();

  try {
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
  } catch (error) {
    // If it's a redirect, let it through
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    // Otherwise return the error
    return { error: "Failed to log out. Please try again." };
  }
}

export async function getCurrentUser() {
  const supabase = await createSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email!,
    fullName: profile?.full_name || "",
    createdAt: user.created_at,
  };
}
