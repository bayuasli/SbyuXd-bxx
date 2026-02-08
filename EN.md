# SBYUXD-BXX

<div align="center">

![SIBAYUXD Banner](https://raw.githubusercontent.com/bayuasli/dat1/main/uploads/ea972f-1770551587133.jpg)

[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Architecture](https://img.shields.io/badge/architecture-Plugin%20Driven-black.svg)]
[![Database](https://img.shields.io/badge/database-better--sqlite3-blue.svg)]
[![Runtime](https://img.shields.io/badge/runtime-Optimized-red.svg)]
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Multi--Device-25D366.svg)](https://whatsapp.com/)

A performance-focused WhatsApp Multi-Device bot built with modular architecture, optimized memory handling, and production-grade stability.

</div>

---

## ⚙ Core Features

- **Multi-Device Ready**  
  Seamless compatibility with WhatsApp Multi-Device protocol.

- **Modular Plugin System**  
  Scalable architecture designed for clean feature isolation.

- **Performance Oriented**  
  Optimized memory usage with controlled execution flow.

- **Queue Engine**  
  Internal task queue to prevent overload and race conditions.

- **Smart Rate Limiter**  
  Anti-spam system with adaptive cooldown logic.

- **better-sqlite3 Powered**  
  High-speed local database engine with synchronous stability.

- **Dynamic Plugin Loader**  
  Auto-detect and load plugins without bloating the core system.

- **Granular Permission Control**  
  Owner / Admin / Group / Private scoped command restrictions.

- **Eval & Shell Access (Owner Only)**  
  Built-in secure evaluation and execution system.

- **Long Uptime Optimized**  
  Periodic garbage collection for stable 24/7 runtime.

---

## 🧱 Architecture Overview

𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱 𝗕𝗼𝘁 is built around a queued execution core system to ensure:

- Controlled message processing
- No race-condition command execution
- Memory-safe runtime
- Clear plugin isolation

The handler dynamically loads plugins and executes them through a permission-gated context layer.

---

## 🖥 System Requirements

- Node.js **v20+**
- npm or yarn
- Stable internet connection

---

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/bayuasli/SbyuXd-bxx.git
cd SbyuXd-bxx
```

### 2. Install Dependencies

```bash
npm install
```

or

```bash
yarn install
```

### 3. Start Bot

```bash
npm start
```

### 4. Authentication

On first run, a pairing code will appear in the terminal.  
Enter the code inside WhatsApp to complete authentication.

---

## 🧩 Plugin Structure

```javascript
/** @type {import('#lib/types.js').Plugin} */
export default {
  name: "name",
  category: "category",
  command: ["command1"],
  alias: ["cmd1"],

  settings: {
    owner: false,
    private: false,
    group: false,
    admin: false,
    botAdmin: false,
    loading: false
  },

  run: async (conn, m, context) => {
    const { Api, Func, downloadM, quoted, metadata, isOwner, isAdmin, isBotAdmin } = context
  },

  on: async (conn, m, context) => {}
}
```

---

## 📁 Directory Structure

```
𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱 𝗕𝗼𝘁/
├── lib/
│   ├── api.js
│   ├── color.js
│   ├── exif.js
│   ├── function.js
│   ├── loadPlugins.js
│   ├── serialize.js
│   └── types.js
├── plugins/
│   ├── downloader/
│   ├── tools/
│   └── utility/
├── config.js
├── handler.js
├── index.js
└── package.json
```

---

## 🕶 Philosophy

Minimal surface.  
Maximum control.  
Zero unnecessary overhead.  

Built for developers who prefer structure over chaos.

---

## 🤝 Contributing

1. Fork repository  
2. Create branch: `feat/your-feature`  
3. Commit changes  
4. Push branch  
5. Open Pull Request  

---

## 📜 License

MIT License.

---

<div align="center">

**Maintained by 𝗦𝗯𝘆𝘂𝗫𝗱**

⭐ Star the repository if this project helps you.

</div>