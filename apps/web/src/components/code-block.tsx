import type { BundledLanguage } from "shiki";

import {
  CodeBlock as AiCodeBlock,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ai-elements/code-block";
import { cn } from "@/lib/utils";

/** The site's one code surface: shiki, plus a filename bar and copy button. */
export function CodeBlock({
  code,
  filename,
  language = "tsx",
  actions,
  className,
}: {
  code: string;
  filename?: string;
  language?: BundledLanguage;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <AiCodeBlock
      className={cn(
        "rounded-none",
        // shiki inlines its own canvas onto the <pre>, a #24292e slab on a black
        // page. Force the surface back and keep only the token colours.
        "[&_pre]:!bg-transparent [&_pre_span]:!bg-transparent",
        className
      )}
      code={code}
      language={language}
    >
      <CodeBlockHeader>
        <CodeBlockTitle>
          <CodeBlockFilename>{filename ?? "example"}</CodeBlockFilename>
        </CodeBlockTitle>
        <div className="-my-1 -mr-1 flex items-center gap-1">
          {actions}
          <CodeBlockCopyButton size="icon-sm" />
        </div>
      </CodeBlockHeader>
    </AiCodeBlock>
  );
}
