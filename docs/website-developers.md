# Developers

openDownloader uses Tauri, Rust, React, and separately managed media tools. The website is a static presentation/documentation layer with an independent build.

## Build from source

Prerequisites: Node.js 24, npm, Rust 1.96, and the [Tauri platform prerequisites](https://tauri.app/start/prerequisites/).

```sh
npm ci
npm run tauri dev
npm run tauri build
```

These commands build the desktop app from the repository root. Building a portability package does not make it a production distribution target.

## Engineering references

- [Architecture](architecture.md): components, IPC, and runtime responsibilities.
- [Universal resolver](universal-resolver.md): media inspection and planning.
- [Performance](performance.md): enforced bounds and unmeasured targets.
- [Packaging](packaging.md): Linux production scope, signing, and publication gates.
- [Security](security.md): controls and residual limitations.
- [CI security gates](ci-security-gates.md): workflow and dependency policy.
- [Quality transparency](quality-transparency.md): evidence and limits.
- [Changelog](../CHANGELOG.md), [third-party notices](../THIRD_PARTY_NOTICES.md), and [license](../LICENSE).

## Website development

See [website authoring and validation](../website/README.md). User documentation remains canonical in repository Markdown; Starlight content is generated deterministically and is not independently edited.

## Historical and release evidence

The [release security disposition](release-remediation.md) records version-scoped decisions and residual risk. It is evidence for maintainers, rather than a user installation guide.
