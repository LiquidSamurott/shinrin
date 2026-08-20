# 🌲 Shinrin - AI-Powered Productivity Suite

<div align="center">

![Tauri](https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=tauri&logoColor=white)
![Vue](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

</div>

## 📖 About Shinrin

**Shinrin** (Japanese for "forest") is a powerful, all-in-one productivity desktop application built with **Tauri** and **Vue 3**. It combines project management, time tracking, learning tools, and an on-device AI assistant - all in one beautiful, privacy-focused package.

**Key Features:**
- 🤖 **Local AI Assistant** - Runs entirely on your device using GGUF models (no cloud required!)
- 📊 **Kanban Boards** - Organize tasks with drag-and-drop boards, cards, and labels
- 📅 **Calendar** - Full-featured calendar with events, reminders, and recurring schedules
- 🃏 **Flashcards** - Spaced repetition learning system with AI-generated content
- ⏱️ **Pomodoro Timer** - Built-in focus timer with session tracking and statistics
- 🔒 **Privacy-First** - All data stays on your device

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher)
- **Rust** (latest stable)
- **Tauri CLI** - Install with: `cargo install tauri-cli`

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/LiquidSamurott/shinrin.git
cd shinrin
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Download the AI model:**
```bash
# Download the GGUF model to src-tauri/models/
# You can use:
# - Qwen3-4B-Q6_K.gguf (default)
# - Or any compatible GGUF model
```

4. **Run in development mode:**
```bash
pnpm tauri dev
```

5. **Build for production:**
```bash
pnpm tauri build
```

---

## 🎯 Features

### 🤖 AI Assistant
- **Local LLM** - Uses GGUF models (Qwen3-4B-Q6_K)
- **AI-Powered Features:**
  - Generate flashcards from notes
  - Suggest Kanban card descriptions
  - Smart task prioritization
  - Content summarization
  - Study plan generation
- **Completely Offline** - No internet required, all processing on your device

### 📊 Kanban Boards
- **Multiple Boards** - Create separate boards for different projects
- **Customizable Columns** - Add/remove/reorder columns (To Do, In Progress, Done, etc.)
- **Rich Cards** - Add titles, descriptions, labels, due dates, and attachments
- **Drag & Drop** - Intuitive drag-and-drop interface
- **AI Enhancements** - Auto-generate card details and task breakdowns

### 📅 Calendar
- **Event Management** - Create, edit, and delete events
- **Recurring Events** - Daily, weekly, monthly, and custom recurrence
- **Reminders** - Set notifications for upcoming events
- **Multiple Views** - Month, week, and day views
- **Integration** - Link events to Kanban cards and Pomodoro sessions

### 🃏 Flashcards
- **Spaced Repetition** - Smart scheduling algorithm for optimal learning
- **Decks** - Organize flashcards into custom decks
- **AI Generation** - Automatically generate flashcards from text
- **Study Modes** - Multiple study modes including quiz and browse
- **Progress Tracking** - Track your learning progress and mastery

### ⏱️ Pomodoro Timer
- **Focus Timer** - Work in focused 25-minute sessions
- **Break Timer** - Short and long breaks with automatic transitions
- **Statistics** - Track sessions completed, focus time, and productivity
- **Customizable** - Adjust work/break durations to your preference
- **Sound Notifications** - Audio cues for session transitions

---

## 🏗️ Architecture

### Tech Stack
```
┌─────────────────────────────────────────────────────┐
│                     Frontend                         │
│  ┌─────────────────────────────────────────────┐    │
│  │  Vue 3 + TypeScript + Pinia (State)          │    │
│  └─────────────────────────────────────────────┘    │
│                       ↓                              │
│  ┌─────────────────────────────────────────────┐    │
│  │  Tauri IPC Bridge                            │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│                     Backend                          │
│  ┌─────────────────────────────────────────────┐    │
│  │  Rust Backend + SQLite Database              │    │
│  └─────────────────────────────────────────────┘    │
│                       ↓                              │
│  ┌─────────────────────────────────────────────┐    │
│  │  AI Engine (GGUF + llama.cpp)               │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Project Structure
```
shinrin/
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── ai/            # AI engine (GGUF inference)
│   │   ├── commands/      # Tauri commands
│   │   └── main.rs
│   ├── models/            # GGUF model files
│   ├── migrations/        # Database migrations
│   └── Cargo.toml
├── src/                    # Vue 3 frontend
│   ├── components/        # Reusable Vue components
│   │   ├── assistant/     # AI Assistant UI
│   │   ├── kanban/        # Kanban board components
│   │   ├── calendar/      # Calendar components
│   │   ├── flashcards/    # Flashcard components
│   │   └── pomodoro/      # Pomodoro timer components
│   ├── stores/            # Pinia stores
│   ├── services/          # AI and API services
│   ├── db/                # Database operations
│   └── views/             # Main page views
├── package.json
└── vite.config.ts
```

---

## 🗄️ Database Schema

The app uses **SQLite** with the following main tables:
- `boards` / `columns` / `cards` - Kanban data
- `calendar_events` / `reminders` - Calendar data
- `decks` / `flashcards` - Flashcard data
- `pomodoro_sessions` - Pomodoro tracking
- `settings` - User preferences

---

## 🔧 Configuration

### AI Model Setup

The app expects a GGUF model file in `src-tauri/models/`. Default: `Qwen3-4B-Q6_K.gguf`

To use a different model:
1. Download your preferred GGUF model
2. Place it in `src-tauri/models/`
3. Update the path in `src-tauri/src/ai/engine.rs`

### Environment Variables

Create a `.env` file:
```env
# Optional, only if using cloud AI services
OPENAI_API_KEY=your_key_here
```

---

## 📦 Building for Production

### Windows
```bash
pnpm tauri build --target x86_64-pc-windows-msvc
# Output: src-tauri/target/release/bundle/msi/
```

### macOS
```bash
pnpm tauri build --target universal-apple-darwin
# Output: src-tauri/target/release/bundle/macos/
```

### Linux
```bash
pnpm tauri build --target x86_64-unknown-linux-gnu
# Output: src-tauri/target/release/bundle/deb/
```

---

## 🧪 Development

### Run Tests
```bash
# Backend tests
cargo test --manifest-path src-tauri/Cargo.toml

# Frontend tests
pnpm test
```

### Linting & Formatting
```bash
# Frontend
pnpm lint
pnpm format

# Backend
cargo fmt
cargo clippy
```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. Open a **Pull Request**

### Development Guidelines
- Follow Vue 3 Composition API patterns
- Use TypeScript for all frontend code
- Write Rust with proper error handling
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) - Desktop app framework
- [Vue 3](https://vuejs.org/) - Frontend framework
- [llama.cpp](https://github.com/ggerganov/llama.cpp) - GGUF inference
- [Qwen3](https://github.com/QwenLM/Qwen) - AI model
- [Vite](https://vitejs.dev/) - Build tool
- [SQLite](https://www.sqlite.org/) - Database

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/LiquidSamurott/shinrin/issues)
- **Discussions**: [GitHub Discussions](https://github.com/LiquidSamurott/shinrin/discussions)

---

<div align="center">

**Built with ❤️ using Tauri and Vue**

[Report Bug](https://github.com/LiquidSamurott/shinrin/issues) · [Request Feature](https://github.com/LiquidSamurott/shinrin/issues)

</div>
```

---

## Also add this `.gitattributes` file for Git LFS:

```bash
# .gitattributes
*.gguf filter=lfs diff=lfs merge=lfs -text
```

## Quick Setup Commands:

```bash
# 1. Download the README
# (Copy the above into README.md)

# 2. Add README to git
git add README.md

# 3. Set up Git LFS for the model
git lfs install
git lfs track "*.gguf"
git add .gitattributes

# 4. Amend the commit
git commit --amend --no-edit

# 5. Force push
git push -u origin main --force
```
