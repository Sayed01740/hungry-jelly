<div align="center">
<img src="/logo.png" width="400" alt="Hungry Jelly Logo" />
</div>

# Hungry Jelly

A vibrant, physics-based arcade game built for the MegaETH ecosystem. Control a wobbly jelly, eat food to grow, avoid spiky enemies, and maintain your fatness!

## 🚀 Launch on MegaETH

This game is optimized for MegaETH Mainnet.

### Features:
- **MegaETH Integration**: Full support for Chain ID 4326/6342.
- **Physics-Based Gameplay**: Smooth wobble and stretch mechanics.
- **Safe Wallet Flow**: Uses standard EVM-compatible wallets (MetaMask).
- **Skin Shop**: Unlock unique styles by reaching high scores.

## 🛠️ Run Locally

**Prerequisites:** Node.js

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Start the development server**:
    ```bash
    npm run dev
    ```
3.  **View the app**: Open [http://localhost:3000](http://localhost:3000)

## 📦 Deployment

### Smart Contracts
The game logic currently relies on local and on-chain state. Smart contracts for additional features can be found in the `megaeth-smart` directory.

To deploy contracts:
1. Navigate to `megaeth-smart`: `cd "megaeth-smart"`
2. Set your `PRIVATE_KEY` in `.env`
3. Run: `npx hardhat run scripts/deploy.js --network megaeth`

## 🛡️ License
MIT

## 📜 Deployed Contracts (MegaETH Testnet)
- **MyContract**: `0xD0D29d3Cc29d09325B92ebE2744Dac3b14342569`

