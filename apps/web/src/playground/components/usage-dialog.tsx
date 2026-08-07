import { CodeBlock } from "@/components/code-block";
import { PackageInstall } from "@/components/package-install";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * The playground's code hand-off. It lives behind a dialog rather than under
 * the stage so the settings and the preview keep the whole page between them.
 */
export function UsageDialog({ snippet }: { snippet: string }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Usage</DialogTrigger>

      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Use these settings</DialogTitle>
          <DialogDescription>
            Install the package, point <code>src</code> at your own logo and
            drop the component in. Every prop below is one you changed here —
            anything left at its default is omitted.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <PackageInstall pkg="benday" />
          <CodeBlock code={snippet} filename="usage.tsx" />
          <p className="text-muted-foreground text-xs leading-relaxed">
            The bake runs in the browser on mount. To skip it at runtime, bake
            once at build time with <code>bakeLogo()</code> and pass the
            resulting map as <code>dotMap</code> instead of <code>src</code>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
