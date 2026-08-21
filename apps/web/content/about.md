# About benday

benday is an open-code thinking indicator built out of your own logo. It rasterizes a mark once, separates ink from background, samples it into a grid of dots, and animates that grid while an agent is working, then settles it back into the crisp logo.

It exists because every AI interface needs somewhere to say it is thinking, and a spinner says it in a voice that belongs to no one. A product already has a mark; this turns that mark into the wait.

## How it is distributed

There is no npm package. Installing runs the shadcn CLI, which copies seven TypeScript files into your project, where they are yours to edit. React is the only import. Everything the CLI writes lives in `registry/` in the repository, and this documentation site imports that same directory rather than keeping a copy, so every example on the site is the code that ships.

## Who maintains it

benday is written and maintained by Kacem Mathlouthi, a software engineer working on AI products (<https://kacemmathlouthi.dev>). Development happens in the open at <https://github.com/KacemMathlouthi/benday>. Issues and pull requests are welcome; `CONTRIBUTING.md` describes the workflow.

## License and releases

benday is MIT licensed. Because the component is copied rather than installed, upgrading is deliberate: re-run the CLI when you want a newer version and diff it against your own edits. Every user-facing change is recorded in the changelog, and the registry payload the CLI reads is regenerated and committed with each change.

## Where to go next

- [Usage and API reference](/usage.md)
- [Contact](/contact.md)
- [Privacy](/privacy.md)
