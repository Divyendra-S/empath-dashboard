"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { clientSchema, type ClientFormData } from "@/lib/validations/client";
import { useCreateClient } from "@/lib/hooks/use-clients";
import { checkEmailUniqueness } from "@/lib/actions/clients";
import { themeConfig } from "@/lib/theme";

interface AddClientModalProps {
  variant?: "default" | "ghost";
  className?: string;
}

export function AddClientModal({ variant = "default", className }: AddClientModalProps) {
  const [open, setOpen] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const createClient = useCreateClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      notes: "",
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setEmailError(null);

    // Check email uniqueness
    const isUnique = await checkEmailUniqueness(data.email);
    if (!isUnique) {
      setError("email", {
        type: "manual",
        message: "This email is already registered to another client",
      });
      setEmailError("This email is already registered to another client");
      return;
    }

    createClient.mutate(data, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setEmailError(null);
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          className={
            variant === "default"
              ? `rounded-2xl text-sm font-semibold text-white shadow-lg transition ${className || ""}`
              : className || ""
          }
          style={
            variant === "default"
              ? {
                  backgroundColor: themeConfig.colors.primary,
                  boxShadow: themeConfig.colors.shadowPrimary,
                }
              : undefined
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          New Client
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New Client</DialogTitle>
          <DialogDescription>
            Enter the client information below. Email must be unique for each client.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="full_name"
              {...register("full_name")}
              placeholder="John Doe"
              disabled={isSubmitting}
              className="rounded-xl border-gray-300 focus:border-[var(--theme-primary-hex)] focus:ring-[var(--theme-primary-hex)]"
            />
            {errors.full_name && (
              <p className="text-sm text-red-600">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="john@example.com"
              disabled={isSubmitting}
              className="rounded-xl border-gray-300 focus:border-[var(--theme-primary-hex)] focus:ring-[var(--theme-primary-hex)]"
            />
            {(errors.email || emailError) && (
              <p className="text-sm text-red-600">{errors.email?.message || emailError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="+91 98765 43210"
              disabled={isSubmitting}
              className="rounded-xl border-gray-300 focus:border-[var(--theme-primary-hex)] focus:ring-[var(--theme-primary-hex)]"
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              {...register("date_of_birth")}
              disabled={isSubmitting}
              className="rounded-xl border-gray-300 focus:border-[var(--theme-primary-hex)] focus:ring-[var(--theme-primary-hex)]"
            />
            {errors.date_of_birth && (
              <p className="text-sm text-red-600">
                {errors.date_of_birth.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Additional notes about the client..."
              rows={4}
              disabled={isSubmitting}
              className="rounded-xl border-gray-300 focus:border-[var(--theme-primary-hex)] focus:ring-[var(--theme-primary-hex)]"
            />
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl text-white"
              style={{
                backgroundColor: themeConfig.colors.primary,
              }}
            >
              {isSubmitting ? "Creating..." : "Create Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
