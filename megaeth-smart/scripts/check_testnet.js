const { ethers } = require("ethers");
async function main() {
    const provider = new ethers.JsonRpcProvider("https://carrot.megaeth.com/rpc");
    const address = "0xdBe3Dc6a3b2d2E5E9617777b12f330F140379b89";
    const balance = await provider.getBalance(address);
    const network = await provider.getNetwork();
    console.log("Address:", address);
    console.log("Network:", network.name, "(ChainId:", network.chainId.toString(), ")");
    console.log("Balance:", ethers.formatEther(balance), "ETH");
}
main().catch(console.error);
