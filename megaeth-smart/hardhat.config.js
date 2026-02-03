require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // MegaETH Mainnet
    megaeth: {
      url: process.env.MEGAETH_MAINNET_RPC || "https://mainnet.megaeth.com/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 4326,
    },
    // MegaETH Testnet (Carrot)
    megaethTestnet: {
      url: process.env.MEGAETH_TESTNET_RPC || "https://carrot.megaeth.com/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 6343,
    },
  },
  etherscan: {
    apiKey: {
      megaeth: "no-api-key-needed",
      megaethTestnet: "no-api-key-needed",
    },
    customChains: [
      {
        network: "megaeth",
        chainId: 4326,
        urls: {
          apiURL: "https://explorer.megaeth.com/api",
          browserURL: "https://explorer.megaeth.com",
        },
      },
      {
        network: "megaethTestnet",
        chainId: 6343,
        urls: {
          apiURL: "https://megaexplorer.xyz/api",
          browserURL: "https://megaexplorer.xyz",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
