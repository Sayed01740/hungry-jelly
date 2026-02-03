
// MegaETH Testnet (Carrot) Params
const MEGAETH_CHAIN_ID = '0x18C7'; // 6343
const MEGAETH_RPC_URL = 'https://carrot.megaeth.com/rpc';
const MEGAETH_FALLBACK_RPC_URL = 'https://megaeth-testnet.drpc.org';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

// Check if already connected without prompting popup
export const checkEVMConnection = async (): Promise<string | null> => {
  if (!window.ethereum) return null;
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts && accounts.length > 0) {
      return accounts[0];
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const connectEVM = async (): Promise<string | null> => {
  if (!window.ethereum) {
    alert("No EVM wallet found! Please install MetaMask.");
    return null;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Attempt to switch to MegaETH Chain
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MEGAETH_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: MEGAETH_CHAIN_ID,
                chainName: 'MegaETH Testnet (Carrot)',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [MEGAETH_RPC_URL, MEGAETH_FALLBACK_RPC_URL],
                blockExplorerUrls: ['https://megaexplorer.xyz'],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add MegaETH network", addError);
        }
      } else {
        console.error("Failed to switch to MegaETH network", switchError);
      }
    }

    return accounts[0];
  } catch (error) {
    console.error("User denied account access", error);
    return null;
  }
};
