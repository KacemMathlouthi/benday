import { Benday } from "@registry/ui/benday";
import { Link } from "react-router";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";

/** No header, no footer: a dead end gets the whole viewport and nothing else. */
export function NotFound() {
  return (
    <Container className="flex min-h-svh flex-col items-center justify-center py-12 text-center">
      <Benday
        preset="scatter"
        size={128}
        src="/benday-mark.svg"
        state="thinking"
      />

      {/* One weight in the pixel face, so size carries the emphasis instead of
          a synthesised bold. Already gridded, so no `tracking-tight` either. */}
      <p className="mt-8 font-pixel-circle text-6xl leading-none sm:text-7xl">
        404
      </p>

      <h1 className="mt-6 font-medium text-2xl tracking-tight">Not found</h1>

      <p className="mt-2 max-w-md text-balance text-muted-foreground leading-relaxed">
        That page scattered and never reconverged.
      </p>

      <div className="mt-8 flex items-center gap-2">
        <Button render={<Link to="/" />}>Back home</Button>
        <Button render={<Link to="/playground" />} variant="outline">
          Playground
        </Button>
      </div>
    </Container>
  );
}
