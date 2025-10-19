"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clientSchema, type ClientFormData } from "@/lib/validations/client";
import { useCreateClient, useUpdateClient } from "@/lib/hooks/use-clients";

interface ClientFormProps {
  client?: ClientFormData & { id: string };
  mode: "create" | "edit";
}

export function ClientForm({ client, mode }: ClientFormProps) {
  const router = useRouter();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client || {
      full_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      notes: "",
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    if (mode === "create") {
      createClient.mutate(data, {
        onSuccess: () => {
          router.push("/dashboard/clients");
        },
      });
    } else if (client?.id) {
      updateClient.mutate(
        { id: client.id, data },
        {
          onSuccess: () => {
            router.push(`/dashboard/clients/${client.id}`);
          },
        }
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Add New Client" : "Edit Client"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Enter the client information below"
            : "Update the client information"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="full_name"
              {...register("full_name")}
              placeholder="John Doe"
              disabled={isSubmitting}
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
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="(555) 123-4567"
              disabled={isSubmitting}
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
            />
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                ? "Create Client"
                : "Update Client"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
