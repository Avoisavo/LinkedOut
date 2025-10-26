import { http } from 'wagmi'
import { baseSepolia, mainnet, base, sepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

// Get WalletConnect project ID from environment variable
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

export const config = getDefaultConfig({
  appName: 'LinkedOut',
  projectId: walletConnectProjectId,
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
