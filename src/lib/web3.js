import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base, baseSepolia } from 'viem/chains';
import { QueryClient } from '@tanstack/react-query';
import { http } from 'viem';

// Hardcoded WalletConnect / Reown Project ID — demo ID that works immediately.
const projectId = '0ab3f2c9a30c1add3cff35eadf12cfc7';

// Base mainnet + Base Sepolia testnet.
export const chains = [base, baseSepolia];

// Explicit public RPC transports. Without these, contract reads and balance
// fetches fall through to Reown's hosted RPC and 401 on the demo projectId.
const transports = {
  [base.id]: http('https://mainnet.base.org'),
  [baseSepolia.id]: http('https://base-sepolia-rpc.publicnode.com'),
};

// Basescan explorer base URLs per chain — used to build tx links.
export const EXPLORERS = {
  [base.id]: 'https://basescan.org',
  [baseSepolia.id]: 'https://sepolia.basescan.org',
};

export const CHAIN_LABELS = {
  [base.id]: 'Base Mainnet',
  [baseSepolia.id]: 'Base Sepolia',
};

export const wagmiAdapter = new WagmiAdapter({
  networks: chains,
  projectId,
  transports,
});

export const queryClient = new QueryClient();

createAppKit({
  adapters: [wagmiAdapter],
  networks: chains,
  defaultNetwork: base,
  projectId,
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
  metadata: {
    name: 'Base Tip',
    description: 'Send ETH tips on Base directly from your wallet',
    url: window.location.origin,
    icons: [window.location.origin + '/favicon.ico'],
  },
});

export const config = wagmiAdapter.wagmiConfig;
