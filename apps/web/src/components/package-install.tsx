import {
  Snippet,
  SnippetAddon,
  SnippetCopyButton,
  SnippetInput,
} from "@/components/ai-elements/snippet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MANAGERS = [
  { command: "bun add", id: "bun" },
  { command: "npm install", id: "npm" },
  { command: "pnpm add", id: "pnpm" },
  { command: "yarn add", id: "yarn" },
];

export function PackageInstall({ pkg }: { pkg: string }) {
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
          <Snippet code={`${manager.command} ${pkg}`}>
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
