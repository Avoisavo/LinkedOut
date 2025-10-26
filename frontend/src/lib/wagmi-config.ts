import { http } from 'wagmi'
import { baseSepolia, mainnet, base, sepolia } from 'wagmi/chains'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { 
  metaMaskWallet,
  walletConnectWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { createConfig } from 'wagmi'

// Get WalletConnect project ID from environment variable
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

// Configure only specific wallets (MetaMask primary, exclude Coinbase)
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        walletConnectWallet,
        rainbowWallet,
      ],
    },
  ],
  {
    appName: 'LinkedOut',
    projectId: walletConnectProjectId,
  }
)

export const config = createConfig({
  connectors,
  chains: [sepolia, baseSepolia, base, mainnet],
  transports: {
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [base.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true, // Enable server-side rendering
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
