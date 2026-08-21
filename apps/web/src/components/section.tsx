import type React from "react";

import { cn } from "@/lib/utils";

/** The page title and its one orientation passage. Every route opens with one. */
export function PageHeader({
  title,
  lead,
  aside,
  children,
}: {
  title: string;
  lead?: string;
  /** Optional artwork or status, pinned to the right of the title block. */
  aside?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-8 py-14">
      <div className="min-w-0">
        <h1 className="font-medium text-3xl tracking-tight">{title}</h1>
        {lead && (
          <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
            {lead}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  );
}

/** A section turn: a rule across the column, so hierarchy is spacing, not cards. */
export function Section({
  title,
  lead,
  actions,
  className,
  children,
}: {
  title: string;
  lead?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("scroll-mt-20 border-border border-t py-10")}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-medium text-lg tracking-tight">{title}</h2>
        {actions}
      </div>
      {lead && (
        <p className="mt-2 max-w-2xl text-muted-foreground leading-relaxed">
          {lead}
        </p>
      )}
      <div className={cn("mt-5 flex flex-col gap-4", className)}>
        {children}
      </div>
    </section>
  );
}

/**
 * Body copy for the pages that are only prose. It runs the full column, like
 * the lists on the usage page: a narrower measure inside this container reads
 * as a half-width block sitting in empty space. Links are styled here rather
 * than at each call site, since the text pages are dense with them.
 */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 text-muted-foreground leading-relaxed [&_a:hover]:text-foreground/80 [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4">
      {children}
    </div>
  );
}

/** A subordinate note tied to the evidence directly above it. */
export function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground text-sm leading-relaxed">{children}</p>
  );
}
