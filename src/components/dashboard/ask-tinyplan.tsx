"use client";

import { useState, useRef, useCallback } from "react";

interface AskTinyPlanProps {
  planContext?: {
    profile: string;
    goal: string;
    bestMoment: string;
    planStyle: string;
    ageRange?: string;
    mainPain?: string;
  };
  inline?: boolean;
}

interface ChatResponse {
  doFirst: string;
  whatToSay: string;
  whatNotToDo: string;
  tinyAction: string;
  adjustPlan: string;
  todayParentSkill?: string;
}

type ConversationPhase = "initial" | "clarifying" | "response";

interface ClarificationState {
  trigger?: string;
  childState?: string;
  step: "trigger" | "childState" | "done";
}

const EMOTIONAL_KEYWORDS = [
  "tantrum",
  "meltdown",
  "crying",
  "won't",
  "refuse",
  "hitting",
  "screaming",
  "angry",
  "upset",
  "scream",
  "throwing",
  "frustrated",
  "defiant",
  "fight",
  "screen",
  "bedtime",
];

const TRIGGER_OPTIONS = [
  "screen time ended",
  "bedtime started",
  "I said no",
  "time to leave",
  "sibling conflict",
  "not sure",
];

const CHILD_STATE_OPTIONS = [
  "no, very upset",
  "a little",
  "yes, calming down",
  "it already passed",
];

const SUGGESTED_PROMPTS = [
  "Tantrum right now",
  "Won't stop screens",
  "Bedtime is hard",
  "Need a quick idea",
  "Feeling overwhelmed",
];

function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "w-5 h-5"}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 20.25V4.875c0-.621.504-1.125 1.125-1.125h14.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125H7.5L3.75 20.25z"
      />
    </svg>
  );
}

function ResponseCard({ data }: { data: ChatResponse }) {
  return (
    <div className="space-y-3">
      <ol className="space-y-2.5 text-sm text-card-foreground list-none pl-0">
        <li className="flex gap-2">
          <span className="shrink-0 w-5 h-5 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center">
            1
          </span>
          <span>
            <strong className="text-foreground">First 30 seconds:</strong>{" "}
            {data.doFirst}
          </span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 w-5 h-5 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center">
            2
          </span>
          <span>
            <strong className="text-foreground">What to say:</strong>{" "}
            {data.whatToSay}
          </span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 w-5 h-5 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center">
            3
          </span>
          <span>
            <strong className="text-foreground">What not to do:</strong>{" "}
            {data.whatNotToDo}
          </span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 w-5 h-5 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center">
            4
          </span>
          <span>
            <strong className="text-foreground">Tiny next step:</strong>{" "}
            {data.tinyAction}
          </span>
        </li>
        {data.todayParentSkill && (
          <li className="flex gap-2">
            <span className="shrink-0 w-5 h-5 rounded-full bg-secondary-light text-secondary text-xs font-bold flex items-center justify-center">
              5
            </span>
            <span>
              <strong className="text-foreground">Today&apos;s parent skill:</strong>{" "}
              {data.todayParentSkill}
            </span>
          </li>
        )}
      </ol>
    </div>
  );
}

function AdjustPlanChips() {
  const [selected, setSelected] = useState<string | null>(null);

  if (selected) {
    return (
      <p className="text-xs text-muted-foreground italic pt-1">
        Got it — {selected.toLowerCase()}.
      </p>
    );
  }

  return (
    <div className="pt-2 space-y-2">
      <p className="text-xs font-medium text-foreground">
        Adjust tomorrow?
      </p>
      <div className="flex flex-wrap gap-2">
        {["Save this as pattern", "Adjust tomorrow", "Keep as is"].map((label) => (
          <button
            key={label}
            onClick={() => setSelected(label)}
            className="px-3 py-1.5 text-xs font-medium rounded-xl border border-border-whisper bg-card text-foreground hover:border-primary hover:text-primary active:scale-[0.97] transition-all"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function OptionChips({
  options,
  onSelect,
}: {
  options: string[];
  onSelect: (option: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className="px-3 py-1.5 text-sm font-medium rounded-xl border border-border-whisper bg-card text-foreground hover:border-primary hover:text-primary active:scale-[0.97] transition-all"
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function ClarifyingQuestions({
  clarification,
  onSelectTrigger,
  onSelectChildState,
}: {
  clarification: ClarificationState;
  onSelectTrigger: (trigger: string) => void;
  onSelectChildState: (state: string) => void;
}) {
  if (clarification.step === "trigger") {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">
          What happened right before this?
        </p>
        <OptionChips options={TRIGGER_OPTIONS} onSelect={onSelectTrigger} />
      </div>
    );
  }

  if (clarification.step === "childState") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-lg">
            {clarification.trigger}
          </span>
        </div>
        <p className="text-sm font-medium text-foreground">
          Can your child listen right now?
        </p>
        <OptionChips
          options={CHILD_STATE_OPTIONS}
          onSelect={onSelectChildState}
        />
      </div>
    );
  }

  return null;
}

function SuggestedPromptChips({
  onSelect,
}: {
  onSelect: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUGGESTED_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="px-3 py-1.5 text-xs font-medium rounded-xl border border-border-whisper bg-card text-muted-foreground hover:border-primary hover:text-primary active:scale-[0.97] transition-all"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

function ChatInput({
  onSend,
  loading,
}: {
  onSend: (message: string) => void;
  loading: boolean;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <div className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Describe what's happening..."
        disabled={loading}
        className="flex-1 h-12 px-4 text-base bg-card border-[1.5px] border-border rounded-xl transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary-glow shadow-inner-subtle disabled:opacity-50"
      />
      <button
        onClick={handleSubmit}
        disabled={loading || value.trim().length === 0}
        className="min-h-[44px] min-w-[44px] px-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover active:scale-[0.97] shadow-button transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          "Send"
        )}
      </button>
    </div>
  );
}

function Disclaimer() {
  return (
    <p className="text-[11px] text-muted-foreground text-center leading-snug mt-3">
      TinyPlan is not a medical professional. For serious concerns, please
      consult your paediatrician.
    </p>
  );
}

function isEmotionalMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return EMOTIONAL_KEYWORDS.some((kw) => lower.includes(kw));
}

export function AskTinyPlan({ planContext, inline = false }: AskTinyPlanProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversationPhase, setConversationPhase] =
    useState<ConversationPhase>("initial");
  const [originalMessage, setOriginalMessage] = useState<string>("");
  const [clarification, setClarification] = useState<ClarificationState>({
    step: "trigger",
  });

  const resetConversation = useCallback(() => {
    setResponse(null);
    setError(null);
    setConversationPhase("initial");
    setOriginalMessage("");
    setClarification({ step: "trigger" });
  }, []);

  const sendToApi = useCallback(
    async (message: string, clarifications?: { trigger: string; childState: string }) => {
      setLoading(true);
      setError(null);
      setResponse(null);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            context: planContext,
            clarifications,
          }),
        });

        if (!res.ok) {
          throw new Error("Request failed");
        }

        const data = await res.json();
        setResponse(data.response);
        setConversationPhase("response");
      } catch {
        setError("Something went wrong. Try tapping an SOS card instead.");
      } finally {
        setLoading(false);
      }
    },
    [planContext]
  );

  const handleSend = useCallback(
    (message: string) => {
      resetConversation();

      if (isEmotionalMessage(message)) {
        setOriginalMessage(message);
        setConversationPhase("clarifying");
        setClarification({ step: "trigger" });
      } else {
        sendToApi(message);
      }
    },
    [resetConversation, sendToApi]
  );

  const handleSelectTrigger = useCallback((trigger: string) => {
    setClarification((prev) => ({ ...prev, trigger, step: "childState" }));
  }, []);

  const handleSelectChildState = useCallback(
    (childState: string) => {
      const updatedClarification = {
        ...clarification,
        childState,
        step: "done" as const,
      };
      setClarification(updatedClarification);
      sendToApi(originalMessage, {
        trigger: updatedClarification.trigger!,
        childState,
      });
    },
    [clarification, originalMessage, sendToApi]
  );

  const conversationContent = (
    <>
      {conversationPhase === "initial" && !loading && !error && !response && (
        <p className="text-sm text-muted-foreground">
          Describe what&apos;s happening and I&apos;ll give you a quick,
          practical reset.
        </p>
      )}

      {conversationPhase === "clarifying" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-lg">
              {originalMessage}
            </span>
          </div>
          <ClarifyingQuestions
            clarification={clarification}
            onSelectTrigger={handleSelectTrigger}
            onSelectChildState={handleSelectChildState}
          />
        </div>
      )}

      {loading && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Thinking...
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {response && (
        <div className="space-y-3">
          <ResponseCard data={response} />
          <AdjustPlanChips />
        </div>
      )}
    </>
  );

  if (inline) {
    return (
      <div className="space-y-3">
        <ChatInput onSend={handleSend} loading={loading} />

        {conversationPhase === "initial" && !loading && !error && !response && (
          <SuggestedPromptChips onSelect={handleSend} />
        )}

        {(conversationPhase !== "initial" || loading || error || response) && (
          <div className="bg-card rounded-2xl border border-border-whisper shadow-card p-4 space-y-3">
            {conversationContent}
            {response && (
              <button
                onClick={resetConversation}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Ask another question
              </button>
            )}
          </div>
        )}

        <Disclaimer />
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover active:scale-[0.97] cta-glow transition-all duration-150"
      >
        <ChatBubbleIcon className="w-5 h-5" />
        Ask TinyPlan
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Ask TinyPlan"
        >
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => {
              setOpen(false);
              resetConversation();
            }}
          />

          <div className="relative w-full max-w-lg bg-card rounded-t-3xl shadow-hero px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] max-h-[85vh] flex flex-col animate-slide-up">
            <div className="flex justify-center mb-3">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ChatBubbleIcon className="w-5 h-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">
                  Ask TinyPlan
                </h2>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  resetConversation();
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-3">
              {conversationContent}
            </div>

            <ChatInput onSend={handleSend} loading={loading} />

            {conversationPhase === "initial" && !loading && !error && !response && (
              <div className="mt-3">
                <SuggestedPromptChips onSelect={handleSend} />
              </div>
            )}

            {response && (
              <button
                onClick={resetConversation}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-3 text-center"
              >
                Ask another question
              </button>
            )}

            <Disclaimer />
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
