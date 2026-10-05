# Troubleshooting & Reliability Guide — openDownloader

## 1. Common Diagnostics & Solutions

### 1.1 Tool Engine Issues

| Symptom | Probable Cause | Corrective Action |
| :--- | :--- | :--- |
| **"Tool missing or damaged"** | Executable missing or checksum validation failed. | Open **Engine Tools** in the header and use **Install**, **Update**, or **Repair** for the affected tool. |
| **"Checksum mismatch"** | Incomplete download or tampered binary. | Use **Repair** for the affected tool. Do not bypass checksum validation. |
| **"Permission denied running executable"** | The selected executable cannot run with the current permissions or location. | Check the configured path and executable permissions. Use a trusted system tool or reinstall the managed tool; do not disable security controls. |

### 1.2 Linux Launch Issues

| Symptom | Probable Cause | Corrective Action |
| :--- | :--- | :--- |
| **`symbol lookup error: /snap/core20/.../libpthread.so.0: undefined symbol: __libc_pthread_init, version GLIBC_PRIVATE`** | `LD_LIBRARY_PATH` points to Snap's private glibc libraries, which do not match the host system libraries used by the app. | Start the app with `env -u LD_LIBRARY_PATH npm run tauri dev`, or clear `LD_LIBRARY_PATH` in the terminal before running the app. |

### 1.3 Download Failures

| Symptom | Probable Cause | Corrective Action |
| :--- | :--- | :--- |
| **"Unsupported URL"** | Non-HTTP/HTTPS link or unsupported site. | Verify the URL starts with `https://` and is accessible in a web browser. |
| **"Destination path write error"** | Destination folder is read-only or invalid. | Choose a writable folder under your home directory using **Save to → Browse**, or set **Default Download Folder** in Settings. |
| **"Filename too long"** | The full output path exceeds a filesystem limit. | Choose a shorter output directory. Backend filename sanitization defaults to 180 characters; the current Settings UI has no trimming toggle. |
| **"Post-processing failed (FFmpeg)"** | FFmpeg binary corrupted or disk out of space. | Verify disk space and use **Repair** on the FFmpeg entry in Engine Tools. |

### 1.4 Cancellation & Recovery
- **Cancelled Downloads**: Cancellation requests terminate child processes using `taskkill /F /T /PID` on Windows or `SIGKILL` on Unix to kill all child processes. Temporary files (`.part`, `.ytdl`) can remain. Retry creates a new job/output folder and does not automatically resume those files.
- **Interrupted job**: A process restart marks every queued or in-flight job Interrupted. Retry is explicit and creates a new job/output folder; partial files from the old attempt are retained and are not assumed complete.

---

## 2. Diagnostics Ring Buffer Inspection

To inspect low-level diagnostic logs:
1. Click the **Diagnostics (Terminal icon)** in the top right header.
2. Review real-time events with timestamp, log level (`INFO`, `WARN`, `ERROR`), and subsystem source (`IPC`, `TOOL_MANAGER`, `PROCESS`, `VERIFY`).
3. Select **Generated CLI Command**, then **Copy Arguments** to copy its command preview.
4. Use the clear-logs control to reset the bounded in-memory diagnostics buffer (at most 256 entries and 64 KiB of retained text).

## 3. Package, source, and optional-tool questions

- **Debian installation fails:** obtain the exact Linux x86_64 package from the official release and verify it first. Install the local `.deb` with `sudo apt install ./<actual-package>.deb` (filename template). Read apt's architecture and dependency error before proceeding; do not bypass package verification.
- **Packaged app does not launch:** start `opendownloader` in a terminal to inspect the error. If Snap libraries are injected through `LD_LIBRARY_PATH`, try `env -u LD_LIBRARY_PATH opendownloader`. The development-only launch command above is not required for an installed package.
- **MediaInfo unavailable on Linux:** MediaInfo is optional and has no managed Linux artifact. Install a trusted system CLI or configure its executable path in Settings. See [tool management](tool-management.md).
- **Requested format or source unavailable:** analyze the URL again and review the available streams. Source services can restrict availability, formats, region, or access. A URL opening in a browser does not guarantee that the media tools can acquire it.
- **Sensitive-source retry asks for a URL:** history sanitization removes credentials and most query parameters. Paste the original source again; do not post private URLs or credentials in public reports.
