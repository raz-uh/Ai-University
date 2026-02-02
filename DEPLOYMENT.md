# Deployment Guide - AI Adaptive 3D University

Follow these steps to move from local development to a fully functional deployment on Sepolia Testnet.

## 1. Supabase Backend Setup
1.  **Create a Project**: Go to [Supabase](https://supabase.com) and create a new project.
2.  **Run Schema**: Open the **SQL Editor** in your Supabase dashboard and paste the contents of `supabase/schema.sql`. Run it to create the database tables, views, and functions.
3.  **Get Keys**: Go to **Project Settings > API**.
    -   Copy **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`
    -   Copy **anon public** -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    -   Copy **service_role** -> `SUPABASE_SERVICE_ROLE_KEY` (Keep this secret!)

## 2. Gemini AI Setup
1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Generate a new API Key.
3.  Copy to `GEMINI_API_KEY`.

## 3. Web3 Layer (Sepolia Testnet)
1.  **Get Gas**: Ensure your wallet has some Sepolia ETH. Use a faucet like [Alchemy Sepolia Faucet](https://sepoliafaucet.com/).
2.  **Private Key**: Get your wallet private key (e.g., from MetaMask). **NEVER share this.**
3.  **RPC URL**: Get an Infura or Alchemy Sepolia RPC URL.
4.  **Deploy**:
    ```bash
    npx hardhat run scripts/deploy.js --network sepolia
    ```
5.  **Copy Address**: After deployment, the script will output the `EduToken` address. Copy it to `EDUTOKEN_CONTRACT_ADDRESS`.

## 4. Final Environment Config
Update your `/home/kali/E_Learning/.env.local` with all the values above.

## 5. Running the Distribution Script
Once you have users on the leaderboard, run the reward script weekly:
```bash
node scripts/distributeRewards.js
```

---

### Verification Checklist
- [ ] Diagnostic runs and generates a course in the Supabase `courses` table.
- [ ] Quiz completion updates the `profiles` table with +250 XP.
- [ ] Leaderboard shows the top users.
- [ ] Reward script successfully transfers `EDU` tokens to the top 5 addresses.
