# Getting Started

openDownloader inspects a media URL, lets you review an acquisition plan, and downloads one selected media item per job.

## Download and install

Production distribution targets **Linux x86_64**, as a Debian `.deb` package. Windows and Intel macOS are portability/unsigned-packaging targets, not current production downloads.

Use the website's [Download page](https://dyu20705.github.io/openDownloader/download/) to check release availability and verify the package. GitHub Releases is the canonical binary source. A version in source manifests is not proof of publication. Do not substitute a historical AppImage or ZIP for the current Debian release contract.

When a qualifying Debian release exists, verify its GPG signatures, authenticated checksum manifest, and provenance before installation. Install the exact downloaded package with `sudo apt install ./<actual-package>.deb`; the filename here is a template, not a published asset name.

Open **openDownloader** from the desktop application menu. For source builds, see [Developers](website-developers.md).

## Prepare the media tools

The app checks its required media tools. Use **Engine Tools** in the header to install, update, or repair yt-dlp and FFmpeg/ffprobe. Managed downloads are checked against pinned SHA-256 values. MediaInfo is optional; on Linux, use a system or custom executable if needed. See [tool management](tool-management.md).

## Inspect, review, download

1. Paste an HTTP(S) media URL into the URL field. Click **Analyze**, or press Enter. The **Paste** button also triggers analysis for an HTTP(S) link.
2. Review the detected media and available options. Source availability, formats, chapters, and captions vary by service.
3. Choose **Entire media**, **Audio only**, **Clip**, **Chapter**, **Thumbnail**, or **Subtitles**. Supply a range, chapter, or subtitle language when required.
4. Choose an output profile where relevant: **Best Source**, **Universal**, **Editing**, or **Small**. Review quality and the **Save to** folder; use **Browse** to select a writable directory.
5. Review the acquisition plan, including warnings and expected output, before starting the download.
6. Start the download. Additional requests queue while one download is active.
7. Open **History** from the header. Completed jobs expose **Open file** and **Show in folder** controls. Failed, cancelled, and interrupted jobs offer **Retry**.

A retry creates a new job and output folder. Old partial files are retained; they are not assumed complete or automatically resumed. Sanitized source URLs may require pasting the original link again.

## Limits to know

- Whole-playlist downloading is unsupported; playlist URLs select one item by default.
- Fast clip/chapter cuts can follow nearby keyframes.
- Subtitle exports contain one selected language per job; automatic captions are optional when available.
- History stays local but is not encrypted.
- The project offers no ongoing maintenance or security-response commitment.

See the [User Guide](cheatsheet.md), [Troubleshooting](troubleshooting.md), and [Privacy](../PRIVACY.md).
