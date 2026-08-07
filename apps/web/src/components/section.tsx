import type React from "react";

import { cn } from "@/lib/utils";

/**
 * The page-defining title plus one short orientation passage. Every route opens
 * with exactly one of these, so the first screenful reads the same everywhere.
 */
export function PageHeader({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="py-14">
      <h1 className="font-medium text-3xl tracking-tight">{title}</h1>
      {lead && (
        <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
          {lead}
        </p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}

/**
 * A section turn. The rule spans the reading column rather than boxing the
 * content, so hierarchy comes from spacing and type instead of from cards.
 */
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

/** A subordinate note tied to the evidence directly above it. */
export function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground text-sm leading-relaxed">{children}</p>
  );
}
