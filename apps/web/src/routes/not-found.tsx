import { ThinkingLogo } from "benday/react";
import { Link } from "react-router";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <Container className="flex flex-col items-center py-24 text-center">
      <ThinkingLogo
        preset="scatter"
        size={120}
        src="/benday-mark.svg"
        state="thinking"
      />
      <h1 className="mt-8 font-medium text-2xl tracking-tight">Not found</h1>
      <p className="mt-2 text-muted-foreground">
        That page scattered and never reconverged.
      </p>
      <Button className="mt-6" render={<Link to="/" />} variant="outline">
        Back home
      </Button>
    </Container>
  );
}
