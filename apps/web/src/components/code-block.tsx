import type { BundledLanguage } from "shiki";

import {
  CodeBlock as AiCodeBlock,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ai-elements/code-block";
import { cn } from "@/lib/utils";

/**
 * The site's one code surface: shiki highlighting from ai-elements, wrapped so
 * every snippet on every page carries the same filename bar and copy button.
 */
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
        // shiki paints the github-light/github-dark canvas onto the <pre> as an
        // inline style. Left alone it puts a #24292e slab on a pure black page,
        // so the surface is forced back to the site's own background and only
        // the token colours are kept.
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
