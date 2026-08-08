"use client";

import { useEffect, useRef, useState } from "react";

import type { BakeSource } from "./bake";
import { bake, bakeCached } from "./bake";
import type { BakeOptions, DotMap } from "./types";

export interface UseDotMapResult {
  dotMap: DotMap | null;
  loading: boolean;
  error: Error | null;
  /** Milliseconds the last bake took — handy for tuning. */
  elapsed: number | null;
}

const IDLE: UseDotMapResult = {
  dotMap: null,
  elapsed: null,
  error: null,
  loading: false,
};

const LOADING: UseDotMapResult = { ...IDLE, loading: true };

/**
 * Bake a source into a {@link DotMap}, re-running on change. Strings hit the
 * module cache; Blobs and Files bake fresh, having no stable identity.
 */
export function useDotMap(
  source: BakeSource | null | undefined,
  options: BakeOptions = {}
): UseDotMapResult {
  const optionsKey = JSON.stringify(options);

  // A string plus its options determines the result, so the pair keys the
  // effect. Anything else falls back to reference identity.
  const signature =
    typeof source === "string" ? `${source}|${optionsKey}` : source;

  const optionsRef = useRef<BakeOptions>(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const [state, setState] = useState<UseDotMapResult>(source ? LOADING : IDLE);
  // Reset to a loading frame *during* render when the input changes, rather
  // than in an effect — an effect would paint one frame of stale results first.
  const [lastSignature, setLastSignature] = useState(signature);
  if (signature !== lastSignature) {
    setLastSignature(signature);
    setState(source ? LOADING : IDLE);
  }

  useEffect(() => {
    if (!source) {
      return;
    }

    let live = true;
    const started = performance.now();

    const run = async () => {
      try {
        const dotMap =
          typeof source === "string"
            ? await bakeCached(source, optionsRef.current)
            : await bake(source, optionsRef.current);
        if (live) {
          setState({
            dotMap,
            elapsed: performance.now() - started,
            error: null,
            loading: false,
          });
        }
      } catch (error) {
        if (live) {
          setState({
            dotMap: null,
            elapsed: null,
            error: error as Error,
            loading: false,
          });
        }
      }
    };

    run();

    return () => {
      live = false;
    };
  }, [signature, source]);

  return state;
}
