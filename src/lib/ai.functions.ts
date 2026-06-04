import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const key = process.env.LOVABLE_API_KEY;
if (!key) throw new Error("Missing LOVABLE_API_KEY");
const gateway = createLovableAiGatewayProvider(key);
const model = gateway("google/gemini-3-flash-preview");

// Smart Email Generator
const GenerateEmailInput = z.object({
  purpose: z.string().min(1),
  recipient: z.string().min(1),
  tone: z.enum(["professional", "friendly", "formal", "casual"]),
  keyPoints: z.string().min(1),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GenerateEmailInput.parse(input))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model,
      system:
        "You are an expert workplace communication assistant. Write clear, effective emails.",
      prompt: `Write a ${data.tone} email to ${data.recipient} about: ${data.purpose}. Key points to include: ${data.keyPoints}. Include a subject line at the top prefixed with "Subject: ".`,
    });
    return { result: text };
  });

// Meeting Notes Summarizer
const SummarizeMeetingInput = z.object({
  notes: z.string().min(1),
  format: z.enum(["bullet-points", "paragraph", "action-items"]),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SummarizeMeetingInput.parse(input))
  .handler(async ({ data }) => {
    const formatInstruction =
      data.format === "bullet-points"
        ? "Summarize as concise bullet points covering key discussion topics, decisions, and outcomes."
        : data.format === "action-items"
          ? "Extract only action items with owners and deadlines (if mentioned). Format as a checklist."
          : "Summarize as a concise paragraph covering the main points, decisions, and outcomes.";

    const { text } = await generateText({
      model,
      system:
        "You are a meeting productivity assistant. Summarize meeting notes accurately and concisely.",
      prompt: `Meeting notes:\n\n${data.notes}\n\n${formatInstruction}`,
    });
    return { result: text };
  });

// AI Task Planner
const PlanTasksInput = z.object({
  goal: z.string().min(1),
  context: z.string().optional(),
  deadline: z.string().optional(),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlanTasksInput.parse(input))
  .handler(async ({ data }) => {
    const deadlineContext = data.deadline
      ? `The deadline is ${data.deadline}.`
      : "";
    const contextInfo = data.context
      ? `Additional context: ${data.context}`
      : "";

    const { text } = await generateText({
      model,
      system:
        "You are a project management assistant. Break down goals into actionable, prioritized tasks with realistic time estimates.",
      prompt: `Goal: ${data.goal}\n${contextInfo}\n${deadlineContext}\n\nBreak this down into a prioritized list of actionable tasks. For each task, include:\n- Task name\n- Estimated time\n- Priority (High/Medium/Low)\n- Any dependencies\n\nFormat as a clean markdown list.`,
    });
    return { result: text };
  });

// AI Research Assistant
const ResearchInput = z.object({
  topic: z.string().min(1),
  depth: z.enum(["brief", "detailed", "comprehensive"]),
});

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }) => {
    const depthInstruction =
      data.depth === "brief"
        ? "Provide a brief overview (2-3 paragraphs) with key facts."
        : data.depth === "detailed"
          ? "Provide a detailed analysis with sections, key findings, and context."
          : "Provide a comprehensive research summary with overview, key findings, implications, and sources of information.";

    const { text } = await generateText({
      model,
      system:
        "You are a research assistant. Provide accurate, well-structured information on any topic. Always note when information may be limited or speculative.",
      prompt: `Research topic: ${data.topic}\n\n${depthInstruction}\n\nImportant: If you are uncertain about any facts, clearly state that the information may be incomplete.`,
    });
    return { result: text };
  });
