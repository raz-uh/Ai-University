# 🎓 AI Adaptive 3D University

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r173-lightgrey?logo=three.js)](https://threejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Flash--1.5-orange?logo=google-gemini)](https://deepmind.google/technologies/gemini/)

A state-of-the-art decentralized learning platform featuring **AI-powered adaptive learning**, immersive **3D graphics**, and **multilingual support** (pioneering localized education in Nepali and more).

---

## 🚀 Key Features

### 🧠 AI-Driven Adaptive Learning
- **Diagnostic Interview**: A personalized 5-question interview conducted by Gemini AI to assess your level and learning style.
- **Dynamic Course Generation**: AI generates full course syllabi (titles, modules, and content) customized specifically for you in real-time.
- **Deep Personalization**: Content is tailored for **Beginner**, **Intermediate**, or **Advanced** levels across **Video**, **PDF**, or **Flashcard** preferences.

### 🇳🇵 First-Class Multilingual Support
Built with a global audience in mind, featuring deep localization:
- **Nepali Support**: Full UI and AI content generation in Nepali.
- **Extensible Framework**: Dynamic translation layer supporting English, Spanish, French, Hindi, and more.
- **AI Local Awareness**: The AI "thinks" and responds in your chosen language, ensuring a native learning experience.

### 🎨 Immersive 3D Ecosystem
- **Interactive Canvas**: Custom 3D environment built with React Three Fiber.
- **AI Core**: A visually stunning central hub with custom GLSL shaders that pulse during AI tasks.
- **Dynamic Shadows & Particles**: Optimized space-themed background and particle systems for a premium feel.

### ⛓️ Web3 & Rewards
- **Leaderboard**: Compete with other learners via an XP-based ranking system.
- **Blockchain Rewards**: Integrated Hardhat scripts for distributing EDU tokens (ERC-20) to top performers on the Sepolia testnet.

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A Supabase account
- A Google Gemini API Key

### 2. Installation
```bash
git clone https://github.com/raz-uh/Ai-University.git
cd Ai-University
npm install --legacy-peer-deps
```

### 3. Database Setup (Supabase)
1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** and run the entire content of [supabase/schema.sql](supabase/schema.sql).
   - This creates the `profiles`, `courses`, and `leaderboard` tables.
   - It also sets up the **CRITICAL** Auth trigger for user profiles.

### 4. Environment Variables
Copy the template and fill in your keys:
```bash
cp .env.example .env.local
```
Update `.env.local` with your `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `GOOGLE_GEMINI_API_KEY`.

---

## 🎨 Technology Stack

- **Core**: Next.js 15 (App Router), React 19, TypeScript
- **Visuals**: Three.js, React Three Fiber, Framer Motion
- **AI**: Google Generative AI (Gemini Flash 1.5)
- **Backend**: Supabase (PostgreSQL, Realtime, Row Level Security)
- **Blockchain**: Solidity, Hardhat, Ethers.js

---

## 🛠️ Project Structure

```text
├── app/api/diagnostic/    # AI Orchestration Logic
├── components/            # UI & 3D Components
│   ├── AICore.tsx         # Central AI Shader Model
│   ├── CourseViewer.tsx   # Adaptive Content Renderer
│   └── DiagnosticAgent.tsx # AI Interview Modal
├── context/               # Multilingual & Global State
├── contracts/             # EduToken Smart Contract
├── lib/                   # Supabase & AI Clients
├── scripts/               # Blockchain & Verification Scripts
└── supabase/              # SQL Database Schema
```

---

## 🎮 Deployment

The project is optimized for **Vercel** or **Netlify**.
1. Push to your GitHub.
2. Add your environment variables in the dashboard.
3. The production build (`npm run build`) is verified to handle all dependency conflicts and TypeScript strictness.

---

## 🤝 Contributing
Contributions are welcome! If you have ideas for new shaders, AI prompts, or language supports, feel free to open a PR.

## 📝 License
Distributed under the **MIT License**.

---

Built with ❤️ by Rajendra Shahi & Antigravity AI
