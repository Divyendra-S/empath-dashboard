"use client";

import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  oldDate: Date;
  newDate: Date;
  clientName: string;
}

export function RescheduleDialog({
  open,
  onOpenChange,
  onConfirm,
  oldDate,
  newDate,
  clientName,
}: RescheduleDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border" style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}>
        <AlertDialogHeader>
          <AlertDialogTitle>Reschedule Session</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Are you sure you want to reschedule this session for {clientName}?</p>
            <div className="mt-4 space-y-1 text-sm">
              <p className="font-medium text-gray-900">From:</p>
              <p className="text-gray-600">
                {format(oldDate, "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </p>
              <p className="font-medium text-gray-900 mt-2">To:</p>
              <p className="text-gray-600">
                {format(newDate, "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Confirm Reschedule
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
