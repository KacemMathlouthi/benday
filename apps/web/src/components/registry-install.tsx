import {
  Snippet,
  SnippetAddon,
  SnippetCopyButton,
  SnippetInput,
} from "@/components/ai-elements/snippet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MANAGERS = [
  { command: "bunx shadcn@latest add", id: "bun" },
  { command: "npx shadcn@latest add", id: "npm" },
  { command: "pnpm dlx shadcn@latest add", id: "pnpm" },
  { command: "yarn dlx shadcn@latest add", id: "yarn" },
];

// `@benday` is in the shadcn registry directory, so the namespace resolves
// without a components.json entry: https://github.com/shadcn-ui/ui/pull/11447
export function RegistryInstall({
  item = "@benday/benday",
}: {
  item?: string;
}) {
  return (
    <Tabs defaultValue="bun">
      <TabsList>
        {MANAGERS.map((manager) => (
          <TabsTrigger key={manager.id} value={manager.id}>
            {manager.id}
          </TabsTrigger>
        ))}
      </TabsList>

      {MANAGERS.map((manager) => (
        <TabsContent className="mt-2" key={manager.id} value={manager.id}>
          <Snippet code={`${manager.command} ${item}`}>
            <SnippetInput aria-label={`${manager.id} install command`} />
            <SnippetAddon align="inline-end">
              <SnippetCopyButton />
            </SnippetAddon>
          </Snippet>
        </TabsContent>
      ))}
    </Tabs>
  );
}
