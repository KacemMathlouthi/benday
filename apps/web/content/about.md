# About benday

benday is an open-code thinking indicator built out of your own logo. It samples a mark into a grid of dots and animates that grid while an agent is working, then settles it back into the crisp logo.

It exists because a spinner says "thinking" in a voice that belongs to no one. A product already has a mark; this turns that mark into the wait.

## How it is distributed

There is no npm package. Installing runs the shadcn CLI, which copies seven TypeScript files into your project, where they are yours to edit. React is the only import. Everything the CLI writes lives in `registry/`, which this site imports rather than copying, so every example here is the code that ships.

## Who maintains it

benday is written and maintained by Kacem Mathlouthi, a software engineer working on AI products (<https://kacemmathlouthi.dev>). Development happens in the open at <https://github.com/KacemMathlouthi/benday>. Issues and pull requests are welcome; `CONTRIBUTING.md` describes the workflow.

## License and releases

benday is MIT licensed. Because the component is copied rather than installed, upgrading is deliberate: re-run the CLI, then diff against your own edits. Every user-facing change is recorded in the changelog.

## Where to go next

- [Usage and API reference](/usage.md)
- [Contact](/contact.md)
- [Privacy](/privacy.md)
