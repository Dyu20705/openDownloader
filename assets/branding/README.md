# openDownloader mark — future release source

The canonical mark is `opendownloader-icon.svg`: a blue rounded square, a white downward arrow, and a simple landing bar. There is no lettering, gradient, or shadow. The wide arrow stem and generous margins preserve recognition at small sizes.

Generate assets using the existing locked Tauri CLI after installing root dependencies:

```sh
npm ci
node scripts/branding/generate-icons.mjs
node scripts/branding/generate-icons.mjs --check
```

The generator stages official Tauri output in a temporary directory and copies only the existing desktop asset set: `32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.ico`, and `icon.icns`. It also copies the exact SVG to the website favicon. Tauri emits ICNS image chunks in nondeterministic order; the generator sorts those chunks without changing image payload bytes. PNG and ICO output is preserved byte-for-byte. Mobile/Appx extras are discarded; they do not imply supported production platforms.

Website dev/check/build regenerate the favicon directly from this master without requiring root application dependencies. The website navigation and docs logo use the same mark.

Inspect 16, 24, 32, 48, 64, 128, 256, and 512 pixel renderings before changing the master. Do not independently edit derived icons. `--check` regenerates into a temporary directory and compares bytes using the locked CLI.

**Release boundary:** this icon is present in source on dev and will only enter production artifacts during a future owner-approved release. This work does not rebuild or replace any published package, change the version, create/move a tag, or publish a release. The desktop application's functional UI is unchanged.
