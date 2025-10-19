"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientStats } from "@/lib/hooks/use-clients";
import { Calendar, CheckCircle, Clock } from "lucide-react";

interface ClientStatsProps {
  clientId: string;
}

export function ClientStats({ clientId }: ClientStatsProps) {
  const { data: stats, isLoading } = useClientStats(clientId);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Sessions",
      value: stats?.total || 0,
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Upcoming",
      value: stats?.upcoming || 0,
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Completed",
      value: stats?.completed || 0,
      icon: CheckCircle,
      color: "text-green-600",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <Icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
