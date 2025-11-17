# WebHash (File Hash Viewer – Next.js + MUI)

A **responsive multi-file hash viewer** built with **Next.js (App Router)** and **Material UI v6**.  
Supports **drag & drop** and **file picker** uploads, computes multiple hash algorithms **entirely in the browser**, and shows them in a compact, copy‑friendly table with **Light / Dark / Night** themes.

---

## ✨ Features

- **Multi-file upload**
  - Drag & drop one or more files anywhere on the drop zone.
  - Or click the **“Browse files”** button to open the system file picker.
  - All files are queued and processed sequentially for stability with large inputs.

- **Client-side hashing only**
  - Files never leave the browser: all hashing is executed with **CryptoJS** in the client.
  - Suitable for sensitive data where uploading to a remote server is not acceptable.
  - Uses a streaming‑like approach (ArrayBuffer → WordArray) for reliable hashing.

- **Multiple hash algorithms per file**
  - For every uploaded file WebHash computes:
    - **MD5**
    - **SHA‑1**
    - **SHA‑256**
    - **SHA‑512**
  - Hashes are displayed in a **monospace, wrap‑friendly table**, so long values remain readable on smaller screens.

- **Clickable hash → copy to clipboard**
  - Clicking any MD5 / SHA‑1 / SHA‑256 / SHA‑512 cell:
    - Copies the full hash string to the clipboard (`text/plain`).
    - Shows a **2‑second toast (MUI Snackbar)** such as _“SHA‑256 hash copied to clipboard”_.
  - Includes a graceful fallback (`document.execCommand("copy")`) for browsers without `navigator.clipboard` support.

- **Status + progress indicators**
  - Each file has a **Status** column:
    - `queued` – waiting to be processed.
    - a spinning **CircularProgress** while hashing.
    - `done` – hashing complete.
    - error icon with tooltip when hashing fails.
  - A top‑right **Chip** shows _“Hashing in progress…”_ whenever at least one file is computing.

- **CSV export**
  - One click **Export** button saves `webhash-results.csv` containing:
    - `filename, size_bytes, md5, sha1, sha256, sha512`.
  - Only rows with `done` status are exported.

- **Theming (Light / Night / Dark)**
  - Three MUI theme presets:
    - **Light** – neutral gray background, classic blue primary.
    - **Night (default)** – deep navy background, amber + sky‑blue accents.
    - **Dark** – darker variant with cooler blue/pink accents.
  - Theme toggle in the app bar using icon buttons (sun / moon / dark mode).
  - The selected theme is persisted in `localStorage` under `webhash-theme`.

- **Branding (favicon + BI logo)**
  - Custom **SVG favicon** with gradient card icon for browser tabs.
  - **Horizontal BI logo** (`logo-bi-horizontal.svg`) in the top‑left app bar:
    - Left: rounded dark square with gradient “hash card” icon.
    - Right: “WebHash” text on a dark pill background for good contrast in all themes.

- **Responsive layout**
  - Single‑page layout centered using a MUI `Container`.
  - Hash table container is scrollable with a sticky header on narrower screens.
  - Works well on **mobile browsers**, tablets, and desktop.

---

## 🧰 Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)
![App Router](https://img.shields.io/badge/App%20Router-enabled-blue?style=flat-square)
![MUI](https://img.shields.io/badge/MUI-6.x-007FFF?logo=mui&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![CryptoJS](https://img.shields.io/badge/CryptoJS-4.x-orange)

- **Next.js 15 (App Router)** with **TypeScript**
- **React 18**
- **Material UI v6** (`@mui/material`, `@mui/icons-material`, `@emotion/*`)
- **CryptoJS** for MD5 / SHA‑1 / SHA‑256 / SHA‑512 hashing
- No backend or external APIs – **100% client-side**

---

## 🌐 Live Demo

- Local dev (default): http://localhost:3000  
- Production: *(add your deployment URL here, e.g. Vercel)*

---

## 🔑 Environment

No external APIs or secrets are required.

Create `.env.local` only if you want to add custom environment variables for your own extensions.  
The base WebHash app runs without any additional configuration.

---

## 📁 Project Structure

```text
app/
  layout.tsx               # Root layout, ThemeRegistry wrapper, metadata
  page.tsx                 # Main WebHash view (title, description, HashDropzone)
  globals.css              # Global CSS reset / base styles
  icon.svg                 # App favicon (SVG), used automatically by Next.js
components/
  ThemeRegistry.tsx        # MUI theme provider (Light / Night / Dark + app bar)
  HashDropzone.tsx         # Drag & drop area, file picker, hashing logic, table UI
public/
  logo-bi-horizontal.svg   # Brand logo shown in the app bar
README.md                  # This document
```

---

## 🧩 Component Details

### `ThemeRegistry`

- Wraps the entire app with `ThemeProvider` and `CssBaseline`.
- Provides three theme options (`light`, `night`, `dark`):
  - Internally maps to MUI’s `palette.mode` **light/dark**, while “night” is a custom dark palette.
- Stores the last selected theme in **`localStorage`** (`webhash-theme`).
- Renders:
  - Top **AppBar** with BI logo on the left.
  - Theme toggle buttons on the right.
  - A background that uses `palette.background.default` for consistent theming.

### `HashDropzone`

Core logic for uploading and hashing files:

- Maintains an array of items of shape:

  ```ts
  interface FileHash {
    id: string;
    file: File;
    status: "pending" | "hashing" | "done" | "error";
    md5?: string;
    sha1?: string;
    sha256?: string;
    sha512?: string;
    error?: string;
  }
  ```

- Handles:
  - Drag enter / leave / over / drop events (with visual highlighting).
  - Click to open a hidden `<input type="file" multiple>`.
  - Queued hashing using `FileReader` + `CryptoJS`:
    - Reads each file as `ArrayBuffer`.
    - Converts to a CryptoJS `WordArray`.
    - Computes MD5 / SHA‑1 / SHA‑256 / SHA‑512.

- Renders:
  - A **drop zone card** with icon, helper text, and a “Browse files” button.
  - **Action row** above the table:
    - Progress chip (when hashing).
    - CSV export button.
    - “Clear all” button.
  - **Result table** with:
    - File name and size (bytes + KB).
    - MD5 / SHA‑1 / SHA‑256 / SHA‑512 cells (clickable, copy to clipboard).
    - Status with progress indicator / status text / error icon.

- Clipboard behavior:
  - On click, attempts `navigator.clipboard.writeText(hash)`.
  - Falls back to a hidden `<textarea>` and `document.execCommand("copy")`.
  - Shows a bottom‑center `Snackbar` with a 2‑second timeout.

---

## 🧠 UX Notes

- Files are processed **one at a time** to keep UI responsive even for large files.
- Hash columns use **monospace font** with `overflow-wrap: anywhere` so that long hashes do not break the layout.
- The table container is limited in height with scrollbars, keeping the header visible.
- The drop zone is fully clickable and also responds to drag‑over highlighting, making it clear that it accepts files.
- The app never uploads or logs any file contents – everything is ephemeral in memory.

---

## 🧩 Changelog (current build)

1. **Initial WebHash implementation**
   - Next.js App Router setup with TypeScript.
   - MUI integration and global theming structure.
2. **Drag & drop + file picker**
   - Multi-file upload support with queued hashing.
3. **Multi-hash computation**
   - MD5, SHA‑1, SHA‑256, SHA‑512 per file using CryptoJS.
4. **Result table + CSV export**
   - Scrollable table view with file metadata and hash values.
   - CSV export for completed hashes only.
5. **Theme system**
   - Light / Night (default) / Dark modes, persisted via `localStorage`.
6. **BI logo + favicon**
   - Custom SVG favicon and horizontal logo with high contrast in all modes.
7. **Clickable hash copy + toast**
   - Click any hash to copy it to the clipboard.
   - 2‑second toast notification confirming the copy operation.

---

## 🔗 Useful Commands

```bash
# install dependencies
npm install

# start dev server (http://localhost:3000)
next dev

# type check & build production bundle
next build
```

---

## 📜 License

Internal demo for personal / internal projects.  
Replace this section with your organization’s license terms if needed.
