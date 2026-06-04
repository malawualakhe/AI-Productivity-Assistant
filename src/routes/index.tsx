import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  ListChecks,
  Search,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const tools = [
  {
    title: "Smart Email Generator",
    description: "Craft professional emails with AI-powered suggestions.",
    icon: Mail,
    href: "/email",
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Meeting Notes Summarizer",
    description: "Transform lengthy notes into concise summaries and action items.",
    icon: FileText,
    href: "/meeting",
    color: "bg-green-50 text-green-600",
  },
  {
    title: "AI Task Planner",
    description: "Break down goals into actionable, prioritized tasks.",
    icon: ListChecks,
    href: "/tasks",
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "AI Research Assistant",
    description: "Get structured research on any topic in seconds.",
    icon: Search,
    href: "/research",
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "AI Chatbot",
    description: "Your always-on AI assistant for any workplace question.",
    icon: MessageSquare,
    href: "/chat",
    color: "bg-rose-50 text-rose-600",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      { name: "description", content: "Your AI-powered workplace productivity dashboard." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Welcome to AI Workplace
        </h1>
        <p className="text-lg text-muted-foreground">
          Automate your daily tasks with intelligent AI tools.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.title}
            to={tool.href}
            className="group flex flex-col rounded-xl border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-sm"
          >
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${tool.color}`}>
              <tool.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary">
              {tool.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
              Get started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-foreground">
              Pro Tip
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Start with the AI Chatbot for quick questions, or dive into a specific
              tool like the Email Generator or Task Planner to see AI in action.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
