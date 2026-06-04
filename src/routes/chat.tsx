import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageSquare, Send, User, Bot, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

const STORAGE_KEY = "ai-workplace-chat-messages";
const CHAT_ID = "ai-workplace-chat";

function loadMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as UIMessage[]) : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: UIMessage[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // ignore storage errors
  }
}

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — AI Workplace" },
      { name: "description", content: "Chat with your AI workplace assistant." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const [initialMessages] = useState<UIMessage[]>(loadMessages);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const transport = new DefaultChatTransport({ api: "/api/chat" });

  const { messages, sendMessage, status } = useChat({
    id: CHAT_ID,
    initialMessages,
    transport,
  });

  // Persist messages to localStorage
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus textarea
  useEffect(() => {
    if (status === "ready" || status === "error") {
      textareaRef.current?.focus();
    }
  }, [status]);

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const text = input.trim();
      if (!text || isLoading) return;
      sendMessage({ text });
      setInput("");
    },
    [input, isLoading, sendMessage]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div className="mb-4 space-y-1">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground">
            AI Chatbot
          </h1>
        </div>
        <p className="text-muted-foreground">
          Ask anything about your workplace tasks, planning, or productivity.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border bg-card p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <Bot className="h-10 w-10 opacity-30" />
            <p className="text-sm">Start a conversation with your AI assistant.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-1 space-y-1">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.1s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex items-end gap-2 rounded-xl border bg-card p-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="min-h-[40px] resize-none border-0 bg-transparent px-3 py-2.5 shadow-none focus-visible:ring-0"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="h-9 w-9 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>

      <div className="mt-3">
        <AiDisclaimer />
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const text = message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex items-start gap-3", isUser ? "flex-row-reverse" : "")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary" : "bg-primary/10"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-primary" />
        )}
      </div>
      <div
        className={cn(
          "max-w-[80%] space-y-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground"
              : "text-foreground"
          )}
        >
          {isUser ? (
            <p>{text}</p>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{text}</ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && text && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 gap-1 px-2 text-xs text-muted-foreground"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
      </div>
    </div>
  );
}
