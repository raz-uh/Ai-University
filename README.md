# 🎓 AI Adaptive 3D University

A decentralized learning platform featuring AI-powered adaptive learning, immersive 3D UI, and blockchain-based rewards.

## ✨ Features

- **3D Immersive UI**: Built with React Three Fiber and custom GLSL shaders
- **AI-Powered Learning**: Gemini AI conducts diagnostic interviews and generates personalized course content
- **Adaptive Content**: Multi-format courses (Video, PDF, Flashcards) based on learning preferences
- **Multilingual Support**: Fully localized UI and AI-generated content in **Nepali**, English, Spanish, French, and more.
- **Blockchain Rewards**: ERC-20 tokens distributed to top 5 performers on Sepolia testnet
- **Real-time Leaderboard**: Track progress and compete with other learners

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **3D Graphics**: React Three Fiber, Drei, Three.js
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **AI**: Google Generative AI (Gemini)
- **Blockchain**: Hardhat, Ethers.js, OpenZeppelin, Sepolia Testnet

## 📦 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `GOOGLE_GEMINI_API_KEY`: Your Google Gemini API key (supports `GEMINI_API_KEY` as fallback)
- `SEPOLIA_RPC_URL`: Sepolia RPC endpoint (e.g., Infura, Alchemy)
- `DEPLOYER_PRIVATE_KEY`: Private key for deploying contracts
- `EDUTOKEN_CONTRACT_ADDRESS`: (Will be set after deployment)

### 3. Setup Supabase Database
 
 1. Create a new Supabase project at [supabase.com](https://supabase.com)
 2. In the SQL Editor, copy and run the **entire content** of `supabase/schema.sql`.
    - **CRITICAL**: This schema includes a special Trigger (`handle_new_user`) that automatically creates a user profile upon signup. Without this, the application will hang on login.
 3. Enable Row Level Security (RLS) policies as defined in the schema (automatically handled by the script).
 
 ### 4. Run Development Server
 
 ```bash
 npm run dev
 ```
 
 Open [http://localhost:3000](http://localhost:3000) to see the application.
 
 ## ☁️ Deployment (Netlify/Vercel)
 
 This project is ready for one-click deployment.
 
 1. Push your code to a Git repository (GitHub/GitLab).
 2. Connect the repository to Netlify or Vercel.
 3. **Environment Variables**: Add the following variables in your deployment settings (copy from `.env.local`):
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `GOOGLE_GEMINI_API_KEY`
    - `SEPOLIA_RPC_URL` (Optional, for server scripts)
    - `DEPLOYER_PRIVATE_KEY` (Optional, for server scripts)
 4. Deploy! The application will automatically connect to your Supabase instance.


## 🚀 Blockchain Deployment

### Deploy EduToken Contract to Sepolia

1. Ensure you have Sepolia ETH in your deployer wallet
2. Run the deployment script:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

3. Copy the deployed contract address and add it to `.env.local`:

```
EDUTOKEN_CONTRACT_ADDRESS=0x...
```

### Distribute Weekly Rewards

To distribute 100 EDU tokens to the top 5 performers:

```bash
npx hardhat run scripts/distributeRewards.js --network sepolia
```

This script:
1. Queries the Supabase `leaderboard` materialized view
2. Gets the top 5 users by XP
3. Sends 100 EDU tokens to each wallet address

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   └── diagnostic/       # AI diagnostic interview API
│   └── page.tsx              # Main landing page
├── components/
│   ├── Scene.tsx             # 3D canvas wrapper
│   ├── LandingHub.tsx        # 3D environment scene
│   ├── AICore.tsx            # Pulsing AI sphere with shaders
│   ├── UIOverlay.tsx         # 2D UI overlays
│   └── DiagnosticAgent.tsx   # Interview modal
├── contracts/
│   └── EduToken.sol          # ERC-20 token contract
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── gemini.ts             # Gemini AI integration
├── scripts/
│   ├── deploy.js             # Contract deployment
│   └── distributeRewards.js  # Token distribution
├── supabase/
│   └── schema.sql            # Database schema
└── hardhat.config.js         # Hardhat configuration
```

## 🎮 Usage

### For Learners

1. **Sign Up / Login**: Create an account or log in
2. **Select Language**: Use the HUD menu to switch to **Nepali** or any other supported language.
3. **Start Diagnostic**: Click "Start Diagnostic" to begin the AI interview
4. **Answer Questions**: Provide responses to 3 diagnostic questions (AI will ask and listen in your chosen language)
5. **Get Personalized Courses**: AI generates custom courses with titles and content fully localized to your preference.
5. **Complete Courses**: Study the generated materials
6. **Take Quizzes**: Test your knowledge and earn XP
7. **Climb the Leaderboard**: Top 5 performers receive 100 EDU tokens weekly

### For Administrators

#### Deploy Smart Contract
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

#### Distribute Weekly Rewards
```bash
npx hardhat run scripts/distributeRewards.js --network sepolia
```

#### Refresh Leaderboard (if needed)
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard;
```

## 🎨 3D Scene Features

- **AI Core**: Central pulsing sphere with custom GLSL shaders
- **Floating Rings**: Animated platform rings around the core
- **Orbiting Particles**: Dynamic particle system
- **Starfield Background**: Immersive space environment
- **Interactive Controls**: 
  - Drag to rotate camera
  - Scroll to zoom
  - Click to interact

## 🔐 Security

- Row Level Security (RLS) enabled on all Supabase tables
- Users can only access their own profiles and courses
- Smart contract uses OpenZeppelin's Ownable pattern
- Only contract owner can distribute rewards

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 🎯 Verification

After setup, verify:

1. ✅ 3D scene loads with pulsing AI Core
2. ✅ Diagnostic interview opens and collects responses
3. ✅ Gemini AI generates course syllabi
4. ✅ Courses save to Supabase
5. ✅ Leaderboard displays top users
6. ✅ Smart contract compiles and deploys
7. ✅ Rewards distribute to top 5 wallets

---

Built with ❤️ using Next.js, Three.js, Gemini AI, and Ethereum
# Ai-University
# Ai-University
# Ai-University
