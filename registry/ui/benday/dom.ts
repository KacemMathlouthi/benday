/** Framework-agnostic DOM plumbing; what keeps the React wrapper a thin shell. */

const noop = () => {
  // no environment to observe
};

const canObserve = typeof window !== "undefined";

/** A canvas cannot inherit `currentColor`; resolve it off the computed style. */
export function resolveInk(canvas: HTMLCanvasElement, color: string): string {
  if (color !== "currentColor") {
    return color;
  }
  return getComputedStyle(canvas).color || "#000";
}

/**
 * Fires when the ambient theme could have changed: OS preference, or a
 * `class`/`data-theme` flip up the tree. Re-resolve `currentColor` on it.
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
 * Whether the element is worth painting: on screen and in a visible tab. Off
 * either one, the indicator should cost nothing.
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

/**
 * Backing-store pixel ratio, capped. The floor is 2 even on a 1× display: small
 * marks are all edge, and supersampling a 20px canvas is 1600 cheap pixels.
 */
export function devicePixelRatioCapped(max = 3, min = 2): number {
  const ratio = typeof devicePixelRatio === "undefined" ? 1 : devicePixelRatio;
  return Math.min(max, Math.max(min, ratio || 1));
}
