"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar, dateFnsLocalizer, Event, View } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay, addMinutes } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { useUpdateSession } from "@/lib/hooks/use-sessions";
import { RescheduleDialog } from "./reschedule-dialog";
import type { SessionWithClient, SessionStatus } from "@/lib/types";
import { themeConfig } from "@/lib/theme";

const DragAndDropCalendar = withDragAndDrop<CalendarEvent, object>(Calendar);

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent extends Event {
  resource: {
    session: SessionWithClient;
    status: SessionStatus;
  };
}

interface SessionCalendarProps {
  sessions: SessionWithClient[];
  view?: View;
  onViewChange?: (view: View) => void;
  date?: Date;
  onNavigate?: (date: Date) => void;
}

const statusColors = {
  scheduled: themeConfig.colors.primary,
  in_progress: "#10b981",
  completed: "#6b7280",
  cancelled: "#ef4444",
};

export function SessionCalendar({
  sessions,
  view = "month",
  onViewChange,
  date = new Date(),
  onNavigate,
}: SessionCalendarProps) {
  const router = useRouter();
  const updateSession = useUpdateSession();
  const [rescheduleDialog, setRescheduleDialog] = useState<{
    open: boolean;
    sessionId: string;
    oldDate: Date;
    newDate: Date;
    clientName: string;
  } | null>(null);

  // Convert sessions to calendar events
  const events: CalendarEvent[] = useMemo(
    () =>
      sessions.map((session) => {
        const start = new Date(session.scheduled_at);
        const end = addMinutes(start, session.duration_minutes || 60);

        return {
          id: session.id,
          title: session.client.full_name,
          start,
          end,
          resource: {
            session,
            status: session.status,
          },
        };
      }),
    [sessions]
  );

  // Handle event selection (click)
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      router.push(`/dashboard/sessions/${event.resource.session.id}`);
    },
    [router]
  );

  // Handle event drag and drop
  const handleEventDrop = useCallback(
    ({ event, start }: { event: CalendarEvent; start: string | Date; end: string | Date }) => {
      const session = event.resource.session;
      const newDate = typeof start === "string" ? new Date(start) : start;
      setRescheduleDialog({
        open: true,
        sessionId: session.id,
        oldDate: new Date(session.scheduled_at),
        newDate,
        clientName: session.client.full_name,
      });
    },
    []
  );

  // Confirm reschedule
  const handleConfirmReschedule = useCallback(async () => {
    if (!rescheduleDialog) return;

    await updateSession.mutateAsync({
      id: rescheduleDialog.sessionId,
      data: {
        scheduled_at: rescheduleDialog.newDate.toISOString(),
      },
    });

    setRescheduleDialog(null);
  }, [rescheduleDialog, updateSession]);

  // Handle slot selection (create new session)
  const handleSelectSlot = useCallback(
    ({ start }: { start: Date; end: Date }) => {
      const scheduledAt = format(start, "yyyy-MM-dd'T'HH:mm");
      router.push(`/dashboard/calendar?new=true&scheduled_at=${scheduledAt}`);
    },
    [router]
  );

  // Custom event style
  const eventStyleGetter = useCallback(
    (event: CalendarEvent) => {
      const backgroundColor = statusColors[event.resource.status];
      return {
        style: {
          backgroundColor,
          borderRadius: "4px",
          opacity: 0.9,
          color: "white",
          border: "0px",
          display: "block",
          fontSize: "0.875rem",
          padding: "2px 4px",
        },
      };
    },
    []
  );

  return (
    <>
      <div className="h-[700px] bg-white rounded-lg">
        <DragAndDropCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={onViewChange}
          date={date}
          onNavigate={onNavigate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleEventDrop}
          eventPropGetter={eventStyleGetter}
          selectable
          resizable={false}
          draggableAccessor={() => true}
          popup
          views={["month", "week", "day", "agenda"]}
          step={15}
          showMultiDayTimes
          defaultDate={new Date()}
          className="empath-calendar"
        />
      </div>

      {rescheduleDialog && (
        <RescheduleDialog
          open={rescheduleDialog.open}
          onOpenChange={(open) => !open && setRescheduleDialog(null)}
          onConfirm={handleConfirmReschedule}
          oldDate={rescheduleDialog.oldDate}
          newDate={rescheduleDialog.newDate}
          clientName={rescheduleDialog.clientName}
        />
      )}
    </>
  );
}
