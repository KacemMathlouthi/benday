import type { DotMap } from "@registry/ui/benday";
import { Benday } from "@registry/ui/benday";
import { useEffect, useState } from "react";

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Task,
  TaskContent,
  TaskItem,
  TaskItemFile,
  TaskTrigger,
} from "@/components/ai-elements/task";
import { cn } from "@/lib/utils";
import type { LogoProps } from "@/playground/lib/logo-props";

/** The indicator size across this section — big enough to read as the mark. */
const MARK_SIZE = 24;

const REASONING_TEXT = [
  "Let me think about this step by step.",
  "\n\nFirst I need to understand what the user is actually asking for, and which part of the app it touches.",
  "\n\nThe request is about the checkout flow, so the payment handler is the place to start.",
].join("");

const TASK_STEPS = [
  { file: null, text: 'Searching "app/page.tsx, components structure"' },
  { file: "page.tsx", text: "Read" },
  { file: null, text: "Scanning 52 files" },
  { file: "layout.tsx", text: "Reading files" },
  { file: null, text: "Scanning 2 files" },
];

/** Chunk text into 3–4 character fake tokens, the way a stream arrives. */
function chunkIntoTokens(text: string): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const size = 3 + (i % 2);
    chunks.push(text.slice(i, i + size));
    i += size;
  }
  return chunks;
}

const TOKENS = chunkIntoTokens(REASONING_TEXT);

/**
 * Advance to `length`, hold, then start over — both mocks loop, so the preview
 * is always mid-flight rather than finished when you reach it.
 */
function useLoop(length: number, tickMs: number, holdMs: number): number {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const done = index >= length;
    const timer = setTimeout(
      () => setIndex(done ? 0 : index + 1),
      done ? holdMs : tickMs
    );
    return () => clearTimeout(timer);
  }, [index, length, tickMs, holdMs]);

  return index;
}

function ReasoningMock({ mark }: { mark: React.ReactNode }) {
  const index = useLoop(TOKENS.length, 25, 2400);
  const streaming = index < TOKENS.length;

  return (
    <Reasoning className="w-full" isStreaming={streaming} open>
      <ReasoningTrigger>
        {mark}
        <span className="text-base text-muted-foreground">
          {streaming ? "Thinking…" : "Thought for 4 seconds"}
        </span>
      </ReasoningTrigger>

      {/* Held at the finished text's height from the first token, so the
          stream fills reserved space instead of growing the page. */}
      <div className="mt-2 h-32 overflow-hidden">
        <ReasoningContent className="w-full">
          {TOKENS.slice(0, index).join("")}
        </ReasoningContent>
      </div>
    </Reasoning>
  );
}

function TaskMock({ mark }: { mark: React.ReactNode }) {
  const index = useLoop(TASK_STEPS.length, 900, 2400);

  return (
    // Held open: a collapsing box would defeat the reserved space.
    <Task className="w-full" open>
      <TaskTrigger title="Found project files">
        <div className="flex w-full items-center gap-2 text-base text-muted-foreground">
          {mark}
          <span>
            {index < TASK_STEPS.length
              ? "Working…"
              : `Found ${TASK_STEPS.length} project files`}
          </span>
        </div>
      </TaskTrigger>

      {/* Every step stays in the DOM so the box never resizes; the ones that
          have not arrived yet are just invisible. */}
      <TaskContent className="mt-2 flex flex-col">
        {TASK_STEPS.map((step, i) => (
          <TaskItem
            className={cn(
              "text-sm transition-opacity duration-300",
              i < index ? "opacity-100" : "opacity-0"
            )}
            key={step.text + step.file}
          >
            {step.file ? (
              <span className="inline-flex items-center gap-1">
                {step.text}
                <TaskItemFile>
                  <span>{step.file}</span>
                </TaskItemFile>
              </span>
            ) : (
              step.text
            )}
          </TaskItem>
        ))}
      </TaskContent>
    </Task>
  );
}

/** A full-bleed band whose content is a centred, left-aligned column. */
function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-6">
      <div className="mx-auto w-full max-w-lg">{children}</div>
    </div>
  );
}

export function AgentPreview({
  logo,
  inlineMap,
}: {
  logo: LogoProps;
  /** A map baked for the slot these indicators sit in. */
  inlineMap: DotMap | null;
}) {
  const mark = (
    <Benday
      {...logo}
      dotMap={inlineMap ?? undefined}
      size={MARK_SIZE}
      state="thinking"
    />
  );

  return (
    // Rules span the box, content is a centred column: the block sits in the
    // middle while every line inside starts from the same left edge.
    <div className="flex flex-col divide-y divide-border">
      <Row>
        <ReasoningMock mark={mark} />
      </Row>

      <Row>
        <TaskMock mark={mark} />
      </Row>

      <Row>
        <div className="flex items-center gap-3 text-base text-muted-foreground">
          {mark}
          <span className="whitespace-nowrap">
            Searching the codebase for the auth middleware…
          </span>
        </div>
      </Row>
    </div>
  );
}
