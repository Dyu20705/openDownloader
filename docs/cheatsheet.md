# openDownloader — User Cheatsheet & Guide

This cheatsheet provides a clear, technical reference for acquisition operations, output profiles, quality options, tool management, advanced configuration, and troubleshooting.

---

## 1. Operation and Output Profile Guide

First choose what to acquire, then independently choose how the output should behave.

| Dimension | Choice | Meaning |
| :--- | :--- | :--- |
| **Operation** | Entire Media | Acquire the complete selected video and audio streams. |
| **Operation** | Audio Only | Acquire audio without the video stream. |
| **Output Profile** | Best Source | Preserve the strongest suitable source streams and avoid unnecessary transcoding. |
| **Output Profile** | Universal | Prefer broad playback compatibility; Audio Only produces MP3. |
| **Output Profile** | Editing | Produce an editing-friendly output; Audio Only produces FLAC. |
| **Output Profile** | Small | Select the smallest suitable source streams. |

Clip and Chapter perform fast time-range cuts; boundaries can align to nearby keyframes. Thumbnail exports JPEG. Subtitles exports one selected WebVTT language per job with optional automatic captions. Image and subtitle exports use separate per-job folders and ignore media output profiles.

---

## 2. Quality Options

The UI offers Best Available (Auto), 2160p, 1440p, 1080p, 720p, and 480p video quality choices. Actual output depends on the available source streams and acquisition plan; these choices do not guarantee a resolution, bitrate, or file size. Audio-only acquisition uses the best available audio bitrate.

---

## 3. Tool Management & Supply Chain

openDownloader manages required external helper tools in an isolated, application-local directory without modifying global Windows `PATH` or registry keys:

- **yt-dlp (`v2026.08.19`)**: Media stream extraction engine.
- **FFmpeg & FFprobe (`v9.0.2`)**: Audio/video muxing, stream merging, post-processing, and format conversion.
- **MediaInfo (`v26.05`)**: Optional container verification and stream inspection. Managed installation supports Windows x86_64; Linux and macOS require a system or custom executable.

### Tool Resolution Order
1. Custom path override in **Settings** (if configured).
2. Application-local managed directory (verified against the pinned archive checksum).
3. System environment `PATH` (if already installed).

Debug builds may also search project-relative `./`, `./bin/`, and `./tools/` locations. Release builds never search the process working directory or repository tree.

---

## 4. Advanced Settings Reference

- **Embed Metadata (`--embed-metadata`)**: Writes title, artist/uploader, description, and tags directly into the container tags (ID3 / MP4 tags / Vorbis comments).
- **Embed Thumbnail (`--embed-thumbnail`)**: Embeds full-resolution artwork into the file so file managers (Windows Explorer, Finder) display cover art.
- **Embed Chapters (`--embed-chapters`)**: Injects timestamp markers for videos with multiple segments.
- **Filename sanitization**: The backend sanitizes filenames and uses a default 180-character limit. There is no exposed filename-trimming toggle in the current Settings UI; a filename limit alone does not guarantee that every full output path fits platform limits.
- **Resource handling**: One download is active at a time; progress updates and diagnostic retention are bounded. See [performance characteristics](performance.md) for the exact limits and their scope.

---

## 5. Common Errors & Troubleshooting

| Issue / Error | Cause | Resolution |
| :--- | :--- | :--- |
| **"Invalid or unsupported URL"** | The URL is malformed or from an unsupported service. | Ensure the link starts with `https://` and points to a supported video/audio page. |
| **"FFmpeg missing or damaged"** | FFmpeg binary was not found or failed hash check. | Open **Engine Tools** from the header menu and use **Install**, **Update**, or **Repair** for the affected tool. |
| **"Write permission denied"** | Target output directory is read-only or in a protected system folder. | Choose a writable folder with **Save to → Browse**, or update **Default Download Folder** in Settings. On Linux, a folder under your home directory is a suitable starting point. |
| **"Connection aborted / Geo-restricted"** | The media is blocked in your region or requires age verification. | Check the webpage in your browser to confirm availability. |
| **"Download cancelled"** | User pressed the cancel button. | Open **History** and click **Retry**. This creates a new job and output folder, retaining old partial files rather than automatically resuming them. |

---

## 6. Queue and history

One download runs at a time. Additional requests enter a durable FIFO queue. Open **History** to view jobs, cancel a queued request, open a completed file, or show it in its folder. Failed, cancelled, and interrupted jobs offer **Retry**, which creates a new attempt and output folder. After a restart, queued and in-flight jobs become Interrupted. Sanitized source URLs may require pasting the original URL again. See [troubleshooting](troubleshooting.md) and [privacy](../PRIVACY.md).

## 7. Keyboard Shortcuts

- `Ctrl + V`: Paste URL into the input field.
- `Enter` (in URL field): Trigger media analysis.
- `Tab` / `Shift + Tab`: Navigate the current UI; the exact order depends on the selected operation and enabled controls.
- `Space` / `Enter`: Activate buttons or select operation/profile choices.
- `Escape`: Close any open dialog, modal, or drawer.
