# ClipNode — Share Code Like a Pro 🚀

> Secure, auto-expiring code sharing for developers. Powered by the Monaco Editor engine and built for speed and privacy.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Render-brightgreen?style=for-the-badge&logo=render)](https://clipnode-yeds.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🎯 The Problem

Every day, developers share code snippets, error logs, and configuration files over messaging platforms like Discord, Slack, and WhatsApp. This leads to immediate friction:
* ❌ **Lost Formatting:** Code blocks collapse into unreadable text walls.
* ❌ **Cluttered History:** Temporary debugging snippets pollute chat logs indefinitely.
* ❌ **Data Retention Risks:** Sensitive logs and configuration lines sit permanently stored on third-party servers.

## 💡 What is ClipNode?

**ClipNode** is a sleek, lightweight, self-cleaning code-sharing platform designed specifically for developers. Instead of sending raw text over chat apps, paste your code into a full IDE environment, generate a secure shortlink, and share it instantly.

The snippet automatically self-destructs after **24 hours**. Zero maintenance, zero trace.

---

## ⚡ Core Features

* 🎨 **Monaco-Powered Editor:** Embedded VS Code editor engine for syntax highlighting and keybindings.
* 🔀 **Dynamic Syntax Engine:** Instant code highlighting for JavaScript, Python, C++, HTML, CSS, and more.
* 🔒 **Read-Only Lock:** Shared URLs lock the editor for viewers, preventing accidental edits while preserving formatting.
* 🔗 **Nanoid Shortlinks:** Generates collision-resistant, 7-character URL-friendly slugs.
* ⏳ **Auto-Expiring Vault:** Powered by native MongoDB Time-To-Live (TTL) indexing—snippets automatically purge after 24 hours without requiring background cron jobs.
* ⚡ **Zero-Friction:** No accounts, no logins, and zero onboarding required.

---

## 🔄 How It Works

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  1. PASTE   │ ────> │  2. SHARE   │ ────> │  3. VANISH  │
└─────────────┘       └─────────────┘       └─────────────┘
  Monaco IDE            Nanoid Link           24h MongoDB
  Interface             Generation            TTL Auto-Purge
```

1. **Paste:** Drop code or logs into the editor interface.
2. **Share:** Generate a cryptographically secure 7-character shortlink.
3. **Vanish:** MongoDB automatically sweeps and deletes the snippet after 24 hours.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | EJS | Server-Side Rendering (SSR) |
| **Styling** | Tailwind CSS (CDN) | Modern utility-first styling |
| **Code Editor** | Monaco Editor | Microsoft's VS Code core editor engine |
| **Backend** | Node.js + Express | Fast application server |
| **Database** | MongoDB | Document store |
| **Indexing** | B-Tree & TTL Indexes | Native database-level auto-expirations |
| **Routing** | Express Router | Modular endpoint routing |
| **Shortcodes** | Nanoid | Compact, secure unique ID generation |

---

## 🎯 Who Is This For?

* 👩‍💻 **Software Engineers** sending quick bug fixes, stack traces, and snippets.
* 🎓 **CS Students** collaborating on lab assignments and projects.
* ⚙️ **DevOps Teams** sharing terminal output logs safely without clutter.
* 💬 **Anyone** who wants clean code sharing without raw chat pastes.

---

## 💻 Run It Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas cluster)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/http-snehal/ClipNode.git
   cd ClipNode
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3333
   MONGO_URI=mongodb://localhost:27017/clipnode
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   *Navigate to `http://localhost:3333` in your browser.*

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a Pull Request to improve syntax options, themes, or core functionality.

1. Fork the Project
2. Create a Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Developer

**Snehal Kushwah**
* GitHub: [@http-snehal](https://github.com/http-snehal)
* Live Demo: [ClipNode on Render](https://clipnode-yeds.onrender.com)

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.
