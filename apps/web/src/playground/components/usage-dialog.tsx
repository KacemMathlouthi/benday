import { CodeBlock } from "@/components/code-block";
import { RegistryInstall } from "@/components/registry-install";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** The code hand-off, behind a dialog so settings and preview keep the page. */
export function UsageDialog({ snippet }: { snippet: string }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Usage</DialogTrigger>

      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Use these settings</DialogTitle>
          <DialogDescription>
            Add the source-owned primitive, point <code>src</code> at your own
            logo and drop it in. Every prop below is one you changed here —
            anything left at its default is omitted.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <RegistryInstall />
          <CodeBlock code={snippet} filename="usage.tsx" />
          <p className="text-muted-foreground text-xs leading-relaxed">
            The installed files live in your own <code>components/ui </code>
            directory. Change the presets, renderer or bake pipeline directly.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
