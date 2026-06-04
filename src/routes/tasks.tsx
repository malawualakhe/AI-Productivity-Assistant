import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ListChecks, Wand2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { planTasks } from "@/lib/ai.functions";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — AI Workplace" },
      { name: "description", content: "Break down goals into actionable tasks with AI." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const [goal, setGoal] = useState("");
  const [context, setContext] = useState("");
  const [deadline, setDeadline] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const planTasksFn = useServerFn(planTasks);

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setIsLoading(true);
    try {
      const data = await planTasksFn({
        data: { goal, context: context || undefined, deadline: deadline || undefined },
      });
      setResult(data.result);
    } catch (err) {
      console.error(err);
      setResult("An error occurred while planning tasks. Please try again.");
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
          <ListChecks className="h-5 w-5 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">
            AI Task Planner
          </h1>
        </div>
        <p className="text-muted-foreground">
          Describe your goal and get a prioritized, actionable task breakdown.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="goal">Goal / Project</Label>
          <Input
            id="goal"
            placeholder="e.g., Launch new marketing campaign..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (optional)</Label>
            <Input
              id="deadline"
              placeholder="e.g., End of Q3"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (optional)</Label>
            <Input
              id="context"
              placeholder="Team size, constraints..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!goal.trim() || isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Planning...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Generate Task Plan
            </span>
          )}
        </Button>
      </div>

      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-foreground">
              Task Plan
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
            rows={14}
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
