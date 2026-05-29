"use client";

import { useState, useRef, useCallback } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import type { Locale } from "@/lib/i18n/config";

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

const COPY = {
  es: {
    emotionalKeywords: [
      "berrinche",
      "rabieta",
      "crisis",
      "llorando",
      "llora",
      "no quiere",
      "se niega",
      "pega",
      "pegando",
      "gritando",
      "grita",
      "enojado",
      "enojada",
      "molesto",
      "molesta",
      "tirando",
      "frustrado",
      "frustrada",
      "desafiante",
      "pelea",
      "pantalla",
      "pantallas",
      "dormir",
      "hora de dormir",
    ],
    triggerOptions: [
      "se acabó la pantalla",
      "empezó la hora de dormir",
      "le dije que no",
      "hora de salir",
      "conflicto entre hermanos",
      "no estoy seguro",
    ],
    childStateOptions: [
      "no, muy alterado(a)",
      "un poco",
      "sí, calmándose",
      "ya pasó",
    ],
    suggestedPrompts: [
      "Berrinche ahora mismo",
      "No suelta las pantallas",
      "La hora de dormir es difícil",
      "Necesito una idea rápida",
      "Me siento agobiado(a)",
    ],
    firstThirtySeconds: "Primeros 30 segundos:",
    whatToSay: "Qué decir:",
    whatNotToDo: "Qué no hacer:",
    tinyNextStep: "Siguiente paso pequeño:",
    todaysParentSkill: "Habilidad de hoy:",
    gotIt: (s: string) => `Entendido — ${s.toLowerCase()}.`,
    adjustTomorrow: "¿Ajustar mañana?",
    adjustChips: ["Guardar como patrón", "Ajustar mañana", "Dejar como está"],
    whatHappenedBefore: "¿Qué pasó justo antes de esto?",
    canChildListen: "¿Tu peque puede escuchar ahora mismo?",
    describePlaceholder: "Describe lo que está pasando...",
    send: "Enviar",
    disclaimer:
      "TinyPlan no es un profesional médico. Para preocupaciones serias, consulta a tu pediatra.",
    describePrompt:
      "Cuéntame qué está pasando y te daré un reinicio rápido y práctico.",
    thinking: "Pensando...",
    somethingWrong: "Algo salió mal. Mejor toca una tarjeta de SOS.",
    askAnother: "Hacer otra pregunta",
    triggerButton: "Pregúntale a TinyPlan",
    askTinyPlan: "Pregúntale a TinyPlan",
    close: "Cerrar",
  },
  en: {
    emotionalKeywords: [
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
    ],
    triggerOptions: [
      "screen time ended",
      "bedtime started",
      "I said no",
      "time to leave",
      "sibling conflict",
      "not sure",
    ],
    childStateOptions: [
      "no, very upset",
      "a little",
      "yes, calming down",
      "it already passed",
    ],
    suggestedPrompts: [
      "Tantrum right now",
      "Won't stop screens",
      "Bedtime is hard",
      "Need a quick idea",
      "Feeling overwhelmed",
    ],
    firstThirtySeconds: "First 30 seconds:",
    whatToSay: "What to say:",
    whatNotToDo: "What not to do:",
    tinyNextStep: "Tiny next step:",
    todaysParentSkill: "Today's parent skill:",
    gotIt: (s: string) => `Got it — ${s.toLowerCase()}.`,
    adjustTomorrow: "Adjust tomorrow?",
    adjustChips: ["Save this as pattern", "Adjust tomorrow", "Keep as is"],
    whatHappenedBefore: "What happened right before this?",
    canChildListen: "Can your child listen right now?",
    describePlaceholder: "Describe what's happening...",
    send: "Send",
    disclaimer:
      "TinyPlan is not a medical professional. For serious concerns, please consult your paediatrician.",
    describePrompt:
      "Describe what's happening and I'll give you a quick, practical reset.",
    thinking: "Thinking...",
    somethingWrong: "Something went wrong. Try tapping an SOS card instead.",
    askAnother: "Ask another question",
    triggerButton: "Ask TinyPlan",
    askTinyPlan: "Ask TinyPlan",
    close: "Close",
  },
} as const;

type Copy = (typeof COPY)[Locale];

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

function ResponseCard({ data, copy }: { data: ChatResponse; copy: Copy }) {
  return (
    <div className="space-y-3">
      <ol className="space-y-2.5 text-sm text-card-foreground list-none pl-0">
        <li className="flex gap-2">
          <span className="shrink-0 w-5 h-5 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center">
            1
          </span>
          <span>
            <strong className="text-foreground">{copy.firstThirtySeconds}</strong>{" "}
            {data.doFirst}
          </span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 w-5 h-5 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center">
            2
          </span>
          <span>
            <strong className="text-foreground">{copy.whatToSay}</strong>{" "}
            {data.whatToSay}
          </span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 w-5 h-5 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center">
            3
          </span>
          <span>
            <strong className="text-foreground">{copy.whatNotToDo}</strong>{" "}
            {data.whatNotToDo}
          </span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 w-5 h-5 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center">
            4
          </span>
          <span>
            <strong className="text-foreground">{copy.tinyNextStep}</strong>{" "}
            {data.tinyAction}
          </span>
        </li>
        {data.todayParentSkill && (
          <li className="flex gap-2">
            <span className="shrink-0 w-5 h-5 rounded-full bg-secondary-light text-secondary text-xs font-bold flex items-center justify-center">
              5
            </span>
            <span>
              <strong className="text-foreground">{copy.todaysParentSkill}</strong>{" "}
              {data.todayParentSkill}
            </span>
          </li>
        )}
      </ol>
    </div>
  );
}

function AdjustPlanChips({ copy }: { copy: Copy }) {
  const [selected, setSelected] = useState<string | null>(null);

  if (selected) {
    return (
      <p className="text-xs text-muted-foreground italic pt-1">
        {copy.gotIt(selected)}
      </p>
    );
  }

  return (
    <div className="pt-2 space-y-2">
      <p className="text-xs font-medium text-foreground">
        {copy.adjustTomorrow}
      </p>
      <div className="flex flex-wrap gap-2">
        {copy.adjustChips.map((label) => (
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
  options: readonly string[];
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
  copy,
}: {
  clarification: ClarificationState;
  onSelectTrigger: (trigger: string) => void;
  onSelectChildState: (state: string) => void;
  copy: Copy;
}) {
  if (clarification.step === "trigger") {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">
          {copy.whatHappenedBefore}
        </p>
        <OptionChips options={copy.triggerOptions} onSelect={onSelectTrigger} />
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
          {copy.canChildListen}
        </p>
        <OptionChips
          options={copy.childStateOptions}
          onSelect={onSelectChildState}
        />
      </div>
    );
  }

  return null;
}

function SuggestedPromptChips({
  onSelect,
  copy,
}: {
  onSelect: (prompt: string) => void;
  copy: Copy;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {copy.suggestedPrompts.map((prompt) => (
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
  copy,
}: {
  onSend: (message: string) => void;
  loading: boolean;
  copy: Copy;
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
        placeholder={copy.describePlaceholder}
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
          copy.send
        )}
      </button>
    </div>
  );
}

function Disclaimer({ copy }: { copy: Copy }) {
  return (
    <p className="text-[11px] text-muted-foreground text-center leading-snug mt-3">
      {copy.disclaimer}
    </p>
  );
}

function isEmotionalMessage(message: string, copy: Copy): boolean {
  const lower = message.toLowerCase();
  return copy.emotionalKeywords.some((kw) => lower.includes(kw));
}

export function AskTinyPlan({ planContext, inline = false }: AskTinyPlanProps) {
  const locale = useLocale();
  const copy = COPY[locale];
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
            locale,
          }),
        });

        if (!res.ok) {
          throw new Error("Request failed");
        }

        const data = await res.json();
        setResponse(data.response);
        setConversationPhase("response");
      } catch {
        setError(copy.somethingWrong);
      } finally {
        setLoading(false);
      }
    },
    [planContext, locale, copy]
  );

  const handleSend = useCallback(
    (message: string) => {
      resetConversation();

      if (isEmotionalMessage(message, copy)) {
        setOriginalMessage(message);
        setConversationPhase("clarifying");
        setClarification({ step: "trigger" });
      } else {
        sendToApi(message);
      }
    },
    [resetConversation, sendToApi, copy]
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
          {copy.describePrompt}
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
            copy={copy}
          />
        </div>
      )}

      {loading && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {copy.thinking}
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {response && (
        <div className="space-y-3">
          <ResponseCard data={response} copy={copy} />
          <AdjustPlanChips copy={copy} />
        </div>
      )}
    </>
  );

  if (inline) {
    return (
      <div className="space-y-3">
        <ChatInput onSend={handleSend} loading={loading} copy={copy} />

        {conversationPhase === "initial" && !loading && !error && !response && (
          <SuggestedPromptChips onSelect={handleSend} copy={copy} />
        )}

        {(conversationPhase !== "initial" || loading || error || response) && (
          <div className="bg-card rounded-2xl border border-border-whisper shadow-card p-4 space-y-3">
            {conversationContent}
            {response && (
              <button
                onClick={resetConversation}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copy.askAnother}
              </button>
            )}
          </div>
        )}

        <Disclaimer copy={copy} />
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
        {copy.triggerButton}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={copy.askTinyPlan}
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
                  {copy.askTinyPlan}
                </h2>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  resetConversation();
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label={copy.close}
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

            <ChatInput onSend={handleSend} loading={loading} copy={copy} />

            {conversationPhase === "initial" && !loading && !error && !response && (
              <div className="mt-3">
                <SuggestedPromptChips onSelect={handleSend} copy={copy} />
              </div>
            )}

            {response && (
              <button
                onClick={resetConversation}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-3 text-center"
              >
                {copy.askAnother}
              </button>
            )}

            <Disclaimer copy={copy} />
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
