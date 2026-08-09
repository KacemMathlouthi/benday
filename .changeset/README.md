# Changesets

Changesets record user-facing changes to the Benday registry component.

Create one in the same branch as a change under `registry/`:

```bash
bun run changeset
```

Choose `benday`, select the semver bump, and describe the effect for users. Use `patch` for fixes, `minor` for compatible features such as presets or props, and `major` for breaking API or output changes. Documentation, playground, and repository-only work does not need a release changeset.

To cut a release, run `bun run version-packages`, review and commit the version and changelog updates, then run `bun run release` and push the resulting tag with `git push --follow-tags`. Benday stays private and is never published to npm; Changesets only maintains its version, changelog, and Git tags.
