/**
 * DOM plumbing shared by the renderer. None of this is framework-specific —
 * keeping it here is what lets the React wrapper stay a thin shell.
 */

const noop = () => {
  // no environment to observe
};

const canObserve = typeof window !== "undefined";

/**
 * A canvas cannot inherit `currentColor`, so resolve it against the element's
 * computed style. Any other value passes through untouched.
 */
export function resolveInk(canvas: HTMLCanvasElement, color: string): string {
  if (color !== "currentColor") {
    return color;
  }
  return getComputedStyle(canvas).color || "#000";
}

/**
 * Fires whenever the ambient theme could have changed — OS preference, or a
 * `class`/`data-theme` flip anywhere up the tree (the Tailwind / shadcn
 * convention). The callback should re-resolve `currentColor`.
 */
export function watchTheme(onChange: () => void): () => void {
  if (!canObserve) {
    return noop;
  }

  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", onChange);

  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributeFilter: ["class", "data-theme", "style"],
    attributes: true,
    subtree: true,
  });

  return () => {
    query.removeEventListener("change", onChange);
    observer.disconnect();
  };
}

export function prefersReducedMotion(): boolean {
  if (!canObserve) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function watchReducedMotion(
  onChange: (reduced: boolean) => void
): () => void {
  if (!canObserve) {
    return noop;
  }
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handler = (event: MediaQueryListEvent) => onChange(event.matches);
  query.addEventListener("change", handler);
  return () => query.removeEventListener("change", handler);
}

/**
 * Reports whether the element is worth painting: on screen *and* in a visible
 * tab. An indicator scrolled out of view or sitting in a background tab should
 * cost nothing.
 */
export function watchPaintability(
  element: Element,
  onChange: (paintable: boolean) => void
): () => void {
  if (!canObserve) {
    return noop;
  }

  let onScreen = true;

  const emit = () =>
    onChange(onScreen && document.visibilityState !== "hidden");

  const observer =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver((entries) => {
          const [entry] = entries;
          if (entry) {
            onScreen = entry.isIntersecting;
            emit();
          }
        });

  observer?.observe(element);
  document.addEventListener("visibilitychange", emit);

  // Without an IntersectionObserver, assume on-screen and let visibility drive.
  if (!observer) {
    emit();
  }

  return () => {
    observer?.disconnect();
    document.removeEventListener("visibilitychange", emit);
  };
}

/** Device pixel ratio, capped — beyond 2 the extra pixels buy nothing here. */
export function devicePixelRatioCapped(max = 2): number {
  if (typeof devicePixelRatio === "undefined") {
    return 1;
  }
  return Math.min(max, devicePixelRatio || 1);
}
