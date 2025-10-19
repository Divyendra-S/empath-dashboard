"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSessions } from "@/lib/hooks/use-sessions";
import { SessionCalendar } from "@/components/sessions/session-calendar";
import { SessionForm } from "@/components/sessions/session-form";
import type { SessionStatus } from "@/lib/types";
import type { View } from "react-big-calendar";

export default function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const newParam = searchParams.get("new");
  const scheduledAtParam = searchParams.get("scheduled_at");
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<SessionStatus | undefined>(
    undefined
  );
  const [calendarView, setCalendarView] = useState<View>(
    (viewParam as View) || "month"
  );
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Open drawer when 'new' param is present
  useEffect(() => {
    if (newParam === "true") {
      setIsDrawerOpen(true);
    }
  }, [newParam]);

  const {
    data: sessions,
    isLoading,
    error,
  } = useSessions({ status: statusFilter });

  const handleFilterChange = (value: string) => {
    setStatusFilter(value === "all" ? undefined : (value as SessionStatus));
  };

  const handleViewChange = (view: View) => {
    setCalendarView(view);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleOpenDrawer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("new", "true");
    router.push(`?${params.toString()}`, { scroll: false });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("new");
    params.delete("scheduled_at");
    router.push(`?${params.toString()}`, { scroll: false });
    setIsDrawerOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Calendar</h1>
            <p className="text-gray-600">View and manage your session schedule</p>
          </div>
          <Button onClick={handleOpenDrawer}>
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </Button>
        </div>

      {/* Status Filters */}
      <Tabs defaultValue="all" onValueChange={handleFilterChange}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Calendar View */}
      {error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Error: {error.message}</p>
        </div>
      ) : isLoading ? (
        <Skeleton className="h-[700px] w-full" />
      ) : sessions ? (
        <SessionCalendar
          sessions={sessions}
          view={calendarView}
          onViewChange={handleViewChange}
          date={calendarDate}
          onNavigate={setCalendarDate}
        />
      ) : null}
      </div>

      {/* Slide-over Drawer for New Session */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent 
          className="w-full sm:max-w-2xl overflow-y-auto shadow-2xl border-l p-0"
          onEscapeKeyDown={handleCloseDrawer}
          onInteractOutside={handleCloseDrawer}
        >
          <SheetHeader className="space-y-3 px-6 pt-6 pb-6 border-b">
            <SheetTitle className="text-2xl">New Session</SheetTitle>
            <SheetDescription className="text-base">
              Schedule a new therapy session with your client
            </SheetDescription>
          </SheetHeader>
          <div className="px-6 py-6">
            <SessionForm 
              defaultScheduledAt={scheduledAtParam || undefined}
              onSuccess={handleCloseDrawer}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
