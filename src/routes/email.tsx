import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Send, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateEmail } from "@/lib/ai.functions";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace" },
      { name: "description", content: "Generate professional emails with AI." },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState<string>("professional");
  const [keyPoints, setKeyPoints] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateEmailFn = useServerFn(generateEmail);

  const handleGenerate = async () => {
    if (!purpose.trim() || !recipient.trim() || !keyPoints.trim()) return;
    setIsLoading(true);
    try {
      const data = await generateEmailFn({
        data: { purpose, recipient, tone: tone as "professional" | "friendly" | "formal" | "casual", keyPoints },
      });
      setResult(data.result);
    } catch (err) {
      console.error(err);
      setResult("An error occurred while generating the email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canGenerate =
    purpose.trim() && recipient.trim() && keyPoints.trim();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">
            Smart Email Generator
          </h1>
        </div>
        <p className="text-muted-foreground">
          Describe your email needs and let AI craft the perfect message.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              placeholder="e.g., Team, Client, Manager..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="tone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">Purpose</Label>
          <Input
            id="purpose"
            placeholder="What is this email about?"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="keyPoints">Key Points</Label>
          <Textarea
            id="keyPoints"
            placeholder="List the main points to include in the email..."
            rows={4}
            value={keyPoints}
            onChange={(e) => setKeyPoints(e.target.value)}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!canGenerate || isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Generating...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Generate Email
            </span>
          )}
        </Button>
      </div>

      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-foreground">
              Generated Email
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 gap-1"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Textarea
            value={result}
            onChange={(e) => setResult(e.target.value)}
            rows={12}
            className={cn(
              "resize-y font-mono text-sm leading-relaxed",
              "focus-visible:ring-primary"
            )}
          />
        </div>
      )}

      <AiDisclaimer />
    </div>
  );
}
