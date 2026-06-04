import { AlertTriangle } from "lucide-react";

export function AiDisclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <p className="font-medium text-foreground">Responsible AI Use</p>
        <p>
          AI-generated content may contain inaccuracies. Please review and verify
          all outputs before using them in professional contexts. Do not share
          sensitive personal or confidential information.
        </p>
      </div>
    </div>
  );
}
