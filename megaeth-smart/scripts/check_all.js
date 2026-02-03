const { ethers } = require("ethers");
async function main() {
    const urls = ["https://carrot.megaeth.com/rpc", "https://mainnet.megaeth.com/rpc"];
    for (const url of urls) {
        try {
            const provider = new ethers.JsonRpcProvider(url);
            const address = "0xdBe3Dc6a3b2d2E5E9617777b12f330F140379b89";
            const balance = await provider.getBalance(address);
            const network = await provider.getNetwork();
            console.log(`URL: ${url} | Chain: ${network.chainId} | Balance: ${ethers.formatEther(balance)} ETH`);
        } catch (e) {
            console.log(`URL: ${url} | Error: ${e.message}`);
        }
    }
}
main().catch(console.error);
