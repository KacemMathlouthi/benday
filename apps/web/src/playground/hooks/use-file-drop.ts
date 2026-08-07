import { useCallback, useEffect, useState } from "react";

import type { Sample } from "@/playground/samples";

/**
 * Whole-window drag-and-drop for image files. Reads to a data URI so the
 * dropped file becomes an ordinary cacheable string source.
 */
export function useFileDrop(onFile: (sample: Sample) => void) {
  const [dragging, setDragging] = useState(false);

  const ingest = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          onFile({
            id: `upload-${file.name}-${file.size}`,
            label: file.name,
            note: `${file.type || "unknown type"} · ${(file.size / 1024).toFixed(1)} KB`,
            src: String(reader.result),
          });
        },
        { once: true }
      );
      reader.readAsDataURL(file);
    },
    [onFile]
  );

  useEffect(() => {
    const over = (event: DragEvent) => {
      event.preventDefault();
      setDragging(true);
    };
    // relatedTarget is null only when the pointer actually leaves the window.
    const leave = (event: DragEvent) => {
      if (event.relatedTarget === null) {
        setDragging(false);
      }
    };
    const drop = (event: DragEvent) => {
      event.preventDefault();
      setDragging(false);
      const file = event.dataTransfer?.files?.[0];
      if (file) {
        ingest(file);
      }
    };

    window.addEventListener("dragover", over);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragover", over);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("drop", drop);
    };
  }, [ingest]);

  return { dragging, ingest };
}
