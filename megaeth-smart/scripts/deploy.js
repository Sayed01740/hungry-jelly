const hre = require("hardhat");

/**
 * Main deployment function
 * Deploys MyContract and automatically verifies it on the explorer
 */
async function main() {
  console.log("Starting deployment...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Check if balance is sufficient (at least 0.001 ETH)
  if (balance < hre.ethers.parseEther("0.001")) {
    console.warn("⚠️  Warning: Low balance! Make sure you have enough ETH for deployment.");
  }

  // Initial string value for the contract
  const initialString = process.env.INITIAL_STRING || "Hello, MegaETH!";

  // Get the contract factory
  console.log(`Deploying MyContract with string: "${initialString}"...`);
  const MyContract = await hre.ethers.getContractFactory("MyContract");

  // Deploy the contract with the initial string
  const myContract = await MyContract.deploy(initialString);

  // Wait for deployment transaction to be mined
  console.log("Waiting for deployment transaction to be confirmed...");
  await myContract.waitForDeployment();

  const contractAddress = await myContract.getAddress();
  console.log("\n✅ Contract deployed successfully!");
  console.log("Contract address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);

  // Wait for a few block confirmations before verification
  console.log("\nWaiting for block confirmations...");
  const deploymentTx = myContract.deploymentTransaction();
  if (deploymentTx) {
    await deploymentTx.wait(5); // Wait for 5 confirmations
  }

  // Automatically verify the contract
  console.log(`\nVerifying contract on ${hre.network.name} explorer...`);
  try {
    // Wait a bit more to ensure the contract is indexed
    await new Promise((resolve) => setTimeout(resolve, 30000)); // 30 seconds

    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [initialString],
    });

    console.log("✅ Contract verified successfully!");

    let explorerUrl = "";
    if (hre.network.name === "megaethTestnet") {
      explorerUrl = `https://megaexplorer.xyz/address/${contractAddress}`;
    } else {
      explorerUrl = `https://explorer.megaeth.com/address/${contractAddress}`;
    }
    console.log(`View on explorer: ${explorerUrl}`);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
      console.log("\nYou can verify manually by running:");
      console.log(
        `npx hardhat verify --network ${hre.network.name} ${contractAddress} "${initialString}"`
      );
    }
  }

  console.log("\n🎉 Deployment process completed!");
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
