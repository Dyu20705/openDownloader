# openDownloader website

Static Astro + Starlight presentation and documentation for the desktop application. Hosting: `https://dyu20705.github.io/openDownloader/`. This is an independent npm project; root app dependencies and build behavior are unchanged.

## Local development

Node.js 24.21+ and npm:

```sh
cd website
npm ci
npm run dev
```

`predev`, `precheck`, and `prebuild` regenerate Starlight content automatically. No extra step is needed in a clean clone. If release metadata is absent, a local unavailable state is created; the lifecycle hooks never fetch GitHub data.

## Release acquisition and validation

```sh
npm run release:fetch
npm run validate
```

`release:fetch` makes one public GitHub API request and replaces `.cache/release.json`, including on failure. No token is required or sent. The bounded response is normalized once. Every subsequent build consumes this exact JSON until acquisition is explicitly requested again. There is no runtime GitHub API call and no binary download or mirror.

The latest qualifying stable release must contain exactly one `linux-x86_64__*.deb`, its exact `<deb-name>.asc`, `SHA256SUMS`, `SHA256SUMS.asc`, and `RELEASE-GPG-PUBLIC-KEY.asc`. Duplicate names, ambiguous packages, drafts, prereleases, and malformed URLs are rejected. Attestations are not release assets and are not part of this predicate. UI qualification means asset completeness, not cryptographic verification by the website.

Unavailable API data never reuses an old “latest” value. A historical public release is distinguished from production. A full 100-item API page is treated as unavailable because a single bounded request cannot establish complete history.

For determinism, build twice with the same `.cache/release.json` and compare `dist/`; do not reacquire between builds.

## Canonical content

`docs/getting-started.md`, `docs/cheatsheet.md`, `docs/troubleshooting.md`, `docs/tool-management.md`, `PRIVACY.md`, and the two documentation navigation pages remain canonical repository Markdown. Edit those files, not `src/content/docs/`.

`scripts/content.mjs` defines the explicit source/route mapping. `generate-docs.mjs` parses Markdown, rewrites links through AST nodes, checks local targets against repository files, and adds Starlight frontmatter. Engineering documents remain canonical GitHub links rather than duplicate website chapters. Generated content and metadata are ignored by Git. README's lifecycle paragraph is read verbatim; README itself is not modified.

## Deployment

`.github/workflows/pages.yml` validates relevant PRs and main/dev pushes. Dev and non-main manual dispatches upload a `website-preview` artifact and never deploy production. Main alone may configure/deploy Pages. Release-triggered refresh requires a successful stable-tag push from Signed Linux release in this repository, and the actual remote tag must resolve to the upstream run commit. Annotated tags compare their peeled commit. Manual signing preflights, branch pushes, malformed tags, and missing/mismatched tags do not qualify. Release-triggered builds check out trusted current main and consume no upstream code or artifacts. Dev and main have separate concurrency groups.

Pages must use **Settings → Pages → Source: GitHub Actions**. Only the deploy job receives Pages/OIDC write permissions. No release credentials are accessed.

The demo video depicts an older UI and includes a personal output path, so it is not used. Add actual current-UI screenshots only after inspecting accuracy and privacy; no fake screenshots are provided.

## Canonical corrections and evidence (2026-10-05)

Only the existing cheatsheet, troubleshooting, and tool-management claims below were corrected; application behavior was not changed. Evidence paths below are relative to the repository root.

| Corrected claim | Evidence |
| --- | --- |
| Quality choices do not guarantee bitrate/file size; audio uses its own selector | `src/components/QualityAndDirectory.tsx`, `docs/performance.md` (no reproducible quantitative benchmarks) |
| No Settings filename-trimming toggle; backend default is 180 characters, not a full-path guarantee | `src/components/SettingsModal.tsx`, `src-tauri/crates/core/src/types.rs`, `src-tauri/crates/core/src/path_validator.rs`, `src-tauri/crates/core/src/execution.rs` |
| Writable Linux output folders use Save to/Browse or Default Download Folder | `src/components/QualityAndDirectory.tsx`, `src/components/SettingsModal.tsx` |
| Tool controls are Install/Update/Repair; executable errors do not justify disabling security controls | `src/components/ToolsModal.tsx`, `src-tauri/crates/core/src/tool_manager.rs` |
| History Retry creates a new job/output folder; retained partials are not automatically resumed | `src/components/DownloadHistoryModal.tsx`, `src-tauri/crates/core/src/download_manager.rs`, `docs/security.md` |
| Cancellation terminates process trees; avoid promising immediate resume | `src-tauri/crates/core/src/process_runner.rs`, `docs/troubleshooting.md` interrupted-job contract |
| Diagnostics uses Generated CLI Command/Copy Arguments and a 256-entry/64 KiB bound | `src/components/DiagnosticsDrawer.tsx`, `src-tauri/crates/core/src/diagnostics.rs` |
| Tab order depends on operation-specific controls | `src/components/AcquisitionControls.tsx`, `src/components/UrlInputBar.tsx` |
| Production Linux-only differs from managed-tool/platform portability availability | `.github/workflows/release.yml`, `docs/packaging.md`, `src-tauri/crates/core/src/tool_manager.rs` |
| Installed-package launch, optional Linux MediaInfo, source restrictions and sanitized retries | `docs/packaging.md`, `src-tauri/tauri.conf.json`, `docs/tool-management.md`, `PRIVACY.md`, `src-tauri/crates/core/src/url_validator.rs` |

The documented `workflow_run` trigger has a narrowly scoped zizmor annotation because that required trigger is flagged categorically. Successful upstream push events must originate in this repository; the build checks out main with persisted credentials disabled, has read-only permissions, consumes no upstream artifacts, and does not access release secrets. Manual signing preflights are excluded. The existing workflow audits and release/security policies are unchanged.

## Shared branding

`assets/branding/opendownloader-icon.svg` is the canonical blue square/white download-arrow mark. Website dev/check/build copy the master to the favicon automatically; docs and product navigation use the same mark. Root icon generation uses the existing locked Tauri CLI; see [branding instructions](../assets/branding/README.md). These source icons are for a future owner-approved release, not replacement v1.1.0 packages.
