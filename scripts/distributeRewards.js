import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

async function main() {
    console.log('--- Reward Distribution System ---');

    // 1. Initialize Supabase
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 2. Fetch Top performers from leaderboard
    console.log('Fetching top 5 performers from leaderboard...');
    const { data: topUsers, error } = await supabase
        .from('leaderboard')
        .select('email, wallet_address, xp')
        .limit(5);

    if (error) {
        console.error('❌ Error fetching leaderboard:', error.message);
        return;
    }

    if (!topUsers || topUsers.length === 0) {
        console.warn('⚠️ No users found in leaderboard yet. Skipping distribution.');
        return;
    }

    console.log(`Found ${topUsers.length} users.`);
    topUsers.forEach((u, i) => {
        console.log(`${i + 1}. ${u.email || 'Anonymous'} - ${u.xp} XP (${u.wallet_address || 'No wallet'})`);
    });

    // 3. Prepare Recipients
    const recipients = topUsers
        .filter(user => user.wallet_address && user.wallet_address.startsWith('0x'))
        .map(user => user.wallet_address);

    if (recipients.length === 0) {
        console.warn('⚠️ None of the top performers have linked a wallet. Mission aborted.');
        return;
    }

    // Pad to exactly 5 addresses as required by the contract function
    while (recipients.length < 5) {
        recipients.push('0x0000000000000000000000000000000000000000');
    }

    // 4. Setup Ethereum
    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    const contractAddress = process.env.EDUTOKEN_CONTRACT_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
        console.error('❌ Mission-critical environment variables missing in .env.local');
        return;
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Load ABI (Using the one generated during compile-solc.js)
    const abiPath = path.resolve('artifacts', 'solc', 'EduToken.abi.json');
    if (!fs.existsSync(abiPath)) {
        console.error('❌ ABI not found. Please run compilation first.');
        return;
    }
    const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

    const eduToken = new ethers.Contract(contractAddress, abi, wallet);

    // 5. Execute Distribution
    console.log(`Distributing rewards to ${recipients.filter(r => r !== '0x0000000000000000000000000000000000000000').length} real wallets...`);

    try {
        const tx = await eduToken.distributeWeeklyRewards(recipients);
        console.log(`🚀 Transaction broadcast! Hash: ${tx.hash}`);
        console.log('Waiting for network confirmation...');
        await tx.wait();
        console.log('✅ Rewards distributed successfully on Sepolia!');
    } catch (e) {
        console.error('❌ Reward distribution failed:', e.message);
    }
}

main();
