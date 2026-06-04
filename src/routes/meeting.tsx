import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Wand2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { summarizeMeeting } from "@/lib/ai.functions";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/meeting")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI Workplace" },
      { name: "description", content: "Summarize meeting notes with AI." },
    ],
  }),
  component: MeetingPage,
});

function MeetingPage() {
  const [notes, setNotes] = useState("");
  const [format, setFormat] = useState<string>("bullet-points");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const summarizeMeetingFn = useServerFn(summarizeMeeting);

  const handleGenerate = async () => {
    if (!notes.trim()) return;
    setIsLoading(true);
    try {
      const data = await summarizeMeetingFn({
        data: { notes, format: format as "bullet-points" | "paragraph" | "action-items" },
      });
      setResult(data.result);
    } catch (err) {
      console.error(err);
      setResult("An error occurred while summarizing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">
            Meeting Notes Summarizer
          </h1>
        </div>
        <p className="text-muted-foreground">
          Paste your meeting notes and get a clean summary or action items.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="notes">Meeting Notes</Label>
          <Textarea
            id="notes"
            placeholder="Paste your raw meeting notes here..."
            rows={8}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="format">Output Format</Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger id="format" className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bullet-points">Bullet Points</SelectItem>
              <SelectItem value="paragraph">Paragraph</SelectItem>
              <SelectItem value="action-items">Action Items Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!notes.trim() || isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Summarizing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Summarize Notes
            </span>
          )}
        </Button>
      </div>

      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-foreground">
              Summary
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 gap-1"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Textarea
            value={result}
            onChange={(e) => setResult(e.target.value)}
            rows={12}
            className={cn(
              "resize-y text-sm leading-relaxed",
              "focus-visible:ring-primary"
            )}
          />
        </div>
      )}

      <AiDisclaimer />
    </div>
  );
}
