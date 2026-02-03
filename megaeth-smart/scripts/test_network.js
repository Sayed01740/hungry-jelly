const hre = require("hardhat");
async function main() {
    console.log("Network:", hre.network.name);
    try {
        const [deployer] = await hre.ethers.getSigners();
        console.log("Deployer:", deployer.address);
    } catch (e) {
        console.error("Connection error:", e.message);
    }
}
main().catch(console.error);
