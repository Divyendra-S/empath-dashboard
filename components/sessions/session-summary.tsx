"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SessionSummaryProps {
  summary: string;
  recordingId: string;
  summaryStatus: string;
  onRegenerate?: () => void;
}

export function SessionSummary({
  summary,
  recordingId,
  summaryStatus,
  onRegenerate,
}: SessionSummaryProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    toast.success("Summary copied to clipboard");
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch(
        `/api/recordings/${recordingId}/regenerate-summary`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to regenerate");
      }

      toast.success("Summary generation started! Refresh in 30-60 seconds.");

      // Wait a bit then trigger refetch
      setTimeout(() => {
        onRegenerate?.();
      }, 2000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to regenerate summary"
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  if (summaryStatus === "processing") {
    return (
      <Card
        className="rounded-3xl border shadow-sm"
        style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
      >
        <CardContent className="p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-slate-600 mb-2">
            Generating AI summary...
          </p>
          <p className="text-xs text-slate-400 mb-4">
            This usually takes 30-60 seconds
          </p>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {isRegenerating ? "Retrying..." : "Stuck? Retry"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (summaryStatus === "failed") {
    return (
      <Card className="rounded-3xl border border-rose-200 bg-rose-50/70 shadow-sm">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-rose-600">Failed to generate summary</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4 rounded-xl"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="rounded-3xl border shadow-sm"
      style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Summary
          </CardTitle>
          <p className="text-sm text-slate-500">
            Key insights from this session
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="rounded-2xl border bg-gradient-to-br from-purple-50 to-pink-50 p-6 prose prose-sm max-w-none"
          style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ node, ...props }) => (
                <h1
                  className="text-xl font-bold text-purple-900 mt-4 mb-2"
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="text-lg font-bold text-purple-800 mt-3 mb-2"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  className="text-base font-semibold text-purple-700 mt-2 mb-1"
                  {...props}
                />
              ),
              p: ({ node, ...props }) => (
                <p className="mb-3 text-slate-700 leading-relaxed" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul
                  className="list-disc list-inside mb-3 space-y-1"
                  {...props}
                />
              ),
              ol: ({ node, ...props }) => (
                <ol
                  className="list-decimal list-inside mb-3 space-y-1"
                  {...props}
                />
              ),
              li: ({ node, ...props }) => (
                <li className="text-slate-700" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-semibold text-purple-900" {...props} />
              ),
              em: ({ node, ...props }) => (
                <em className="italic text-slate-600" {...props} />
              ),
            }}
          >
            {summary}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
