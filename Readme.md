# ClipNode — Share Code Like a Pro

**Developer:** Snehal Kushwah
**Problem Statement:** Secure, Auto-Expiring Code Sharing for Developers

---

## What is ClipNode?

ClipNode is a sleek, lightweight code-sharing platform built for developers. Instead of sending messy code over chat apps or dealing with clunky text boxes, you paste your code into a real IDE environment, generate a short link, and share it — and it automatically self-destructs after 24 hours. Think Pastebin, but with VS Code's engine inside.

## The Problem We're Solving

Every day, developers share snippets, error logs, and config files over Discord, Slack, or WhatsApp. The code loses its formatting, clutters the chat history, and leaves sensitive data sitting on third-party servers forever. ClipNode fixes that.

## How It Works

ClipNode is designed for speed and security in 3 simple stages:

* **Paste** — Drop your code or text into the Monaco-powered IDE interface.
* **Share** — Generate a cryptographically secure, 7-character shortlink instantly.
* **Vanish** — The database automatically sweeps and deletes the snippet after 24 hours. Zero trace.

## Core Features

* **Dynamic Syntax Engine** — Select your language and watch the editor instantly color-code JavaScript, Python, C++, HTML, and CSS.
* **Read-Only Mode** — Shared links securely lock the editor, preventing accidental edits by viewers while maintaining perfect formatting.
* **Auto-Expiring Vault** — Built-in MongoDB Time-To-Live (TTL) indexing means no cron jobs or manual cleanups are required. 

## The Engine (Under the Hood)

* **The Monaco Editor** — The exact same underlying text editor that powers Microsoft's VS Code.
* **Nanoid** — Replaces massive database IDs with URL-friendly, collision-resistant short codes.

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | EJS (Server-Side Rendering) |
| **Styling** | Tailwind CSS (CDN) |
| **Code Editor** | Monaco Editor |
| **Backend** | Node.js + Express |
| **Database** | MongoDB |
| **Indexing** | B-Tree & TTL Indexes |
| **Routing** | Express Router |

## Who Is This For?

* Software Engineers sharing quick bug fixes and snippets
* Computer Science students collaborating on assignments
* DevOps teams sharing terminal logs safely without clutter
* Anyone who hates reading unformatted code in a group chat

## Why ClipNode Wins

* ⚡ **Zero-Friction** — No login required, no onboarding. Just paste and share.
* 🗑️ **Self-Cleaning** — MongoDB handles the cleanup automatically; zero server maintenance required.
* 🎨 **Developer-First Aesthetic** — Built with the familiar, high-contrast VS Code dark theme and true syntax highlighting.