import { useEffect, useMemo, useRef, useState } from 'react';
import { bake, bakeCached, bakeKey } from './bake';
import type { BakeSource } from './bake';
import type { BakeOptions, DotMap } from './types';

/** Tracks `prefers-reduced-motion`, live. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return;
    const q = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(q.matches);
    update();
    q.addEventListener('change', update);
    return () => q.removeEventListener('change', update);
  }, []);
  return reduced;
}

/**
 * A counter that bumps whenever the ambient theme could have changed —
 * OS preference, or a `class`/`data-theme` flip anywhere up the tree (the
 * Tailwind / shadcn convention). Used to re-resolve `currentColor`, which a
 * canvas cannot inherit on its own.
 */
export function useThemeTick(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    const mq = typeof matchMedia !== 'undefined' ? matchMedia('(prefers-color-scheme: dark)') : null;
    mq?.addEventListener('change', bump);
    let mo: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined') {
      mo = new MutationObserver(bump);
      mo.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme', 'style'],
        subtree: true,
      });
    }
    return () => {
      mq?.removeEventListener('change', bump);
      mo?.disconnect();
    };
  }, []);
  return tick;
}

export interface UseDotMapResult {
  dotMap: DotMap | null;
  loading: boolean;
  error: Error | null;
  /** Milliseconds the last bake took — handy for tuning. */
  elapsed: number | null;
}

/**
 * Bake a source into a {@link DotMap}, re-running when the source or options
 * change. String sources go through the module-level cache; Blobs and Files
 * are baked fresh (they have no stable identity).
 */
export function useDotMap(
  source: BakeSource | null | undefined,
  options: BakeOptions = {}
): UseDotMapResult {
  const key = useMemo(
    () => (typeof source === 'string' ? bakeKey(source, options) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [source, JSON.stringify(options)]
  );
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [state, setState] = useState<UseDotMapResult>({
    dotMap: null,
    loading: !!source,
    error: null,
    elapsed: null,
  });

  // Non-string sources still need a change signal; identity is enough there.
  const sig = key ?? source;

  useEffect(() => {
    if (!source) {
      setState({ dotMap: null, loading: false, error: null, elapsed: null });
      return;
    }
    let live = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    const started = performance.now();
    const work =
      typeof source === 'string'
        ? bakeCached(source, optionsRef.current)
        : bake(source, optionsRef.current);

    work.then(
      (dotMap) => {
        if (!live) return;
        setState({
          dotMap,
          loading: false,
          error: null,
          elapsed: performance.now() - started,
        });
      },
      (error: Error) => {
        if (!live) return;
        setState({ dotMap: null, loading: false, error, elapsed: null });
      }
    );
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  return state;
}
