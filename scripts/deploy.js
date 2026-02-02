const hre = require("hardhat");

async function main() {
    console.log("Deploying EduToken to Sepolia...");

    const EduToken = await hre.ethers.getContractFactory("EduToken");
    const eduToken = await EduToken.deploy();

    await eduToken.waitForDeployment();

    const address = await eduToken.getAddress();
    console.log(`EduToken deployed to: ${address}`);
    console.log("\n📝 Add this to your .env.local:");
    console.log(`EDUTOKEN_CONTRACT_ADDRESS=${address}`);

    console.log("\n✅ Deployment complete!");
    console.log("Verify on Etherscan (optional):");
    console.log(`npx hardhat verify --network sepolia ${address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
