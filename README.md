# LinkedOut - AI-Powered Workflow Automation with Avail Nexus

LinkedOut is an intelligent workflow automation platform that combines AI agents with crosschain capabilities powered by Avail Nexus. Users can build visual workflows that bridge tokens, execute smart contracts across chains, and automate complex multi-step processes.

## 🌉 Avail Nexus Integration

### SDK Used

This project uses **`@avail-project/nexus-core`** (v0.0.1) for intent-based crosschain operations directly in the browser client.

### Why Nexus Core?

We chose the programmatic SDK layer because our app needs:

- **Dynamic workflow execution**: Users create custom workflows at runtime
- **Flexible contract interaction**: Support for any contract address and function
- **Backend-agnostic**: All crosschain logic happens client-side for maximum flexibility
- **AI integration**: Workflows can combine crosschain operations with AI agents

### Integration Architecture

#### 1. **Nexus Client Initialization** (`frontend/src/lib/avail/nexusClient.ts`)

The Nexus SDK is initialized once per user session with their wallet provider:

```typescript
import { NexusSDK } from "@avail-project/nexus-core";

const nexusClientInstance = await NexusSDK.init({
  wallet: userWalletProvider,
  config: {
    // Auto-detects source chain from wallet
    // Supports Sepolia, Base, Arbitrum, Optimism, Polygon
  },
});
```

**Features:**

- One-time Chain Abstraction account setup via MetaMask signature
- Auto-detects user's current chain as source
- Persists across page reloads
- Handles network switching automatically

#### 2. **Bridge Executor** (`frontend/src/lib/avail/bridgeExecutor.ts`)

Core crosschain operations using Nexus SDK methods:

**Simple Bridge:**

```typescript
export async function executeBridge(params: BridgeParams) {
  const result = await nexusClient.bridge({
    chainId: destinationChainId,
    token: "USDC",
    amount: "0.1",
  });
  // Returns intent ID and explorer URL
}
```

**Bridge & Execute:**

```typescript
export async function executeBridgeAndExecute(params: BridgeAndExecuteParams) {
  const result = await nexusClient.bridgeAndExecute({
    toChainId: destinationChainId,
    token: "USDC",
    amount: "0.1",
    execute: {
      contractAddress: "0x...",
      contractAbi: [...],
      functionName: "deposit",
      buildFunctionParams: (token, amount, chainId, user) => ({
        functionParams: [token, amount, user, 0],
        value: "0"
      }),
      tokenApproval: {
        token: "USDC",
        amount: "0.1",
        chainId: destinationChainId
      }
    }
  });
}
```

**Key Implementation Details:**

- Auto-detects source chain from connected wallet (no hardcoding)
- Token approval configuration for ERC20 tokens (USDC, USDT)
- Contract ABI mapping for common protocols (WETH, USDC, AAVE)
- Comprehensive error handling and logging
- Intent tracking with Nexus Explorer links

#### 3. **Visual Workflow Nodes** (`frontend/src/app/workflow/workflowComponents/`)

**Avail Bridge Node:**

- Drag-and-drop interface for simple token bridging
- Supports ETH, USDC, USDT
- Destination chain selection (Base, Arbitrum, Optimism, Polygon)
- Real-time validation

**Avail Bridge & Execute Node:**

- Combines bridging with smart contract execution
- Custom contract address and function inputs
- Dynamic parameter builder
- ABI-aware execution

**Workflow Executor:**

- Executes nodes sequentially
- Initializes Nexus SDK on first use
- Handles MetaMask prompts and approvals
- Logs execution progress in real-time

## 🎯 Crosschain Capabilities

### What You Can Do

1. **Simple Token Bridging**

   - Bridge ETH, USDC, or USDT between chains
   - Tracks intents on Nexus Explorer
   - Completes in 10-15 minutes

2. **Bridge & Execute in One Intent**

   - Bridge tokens to destination chain
   - Automatically approve token spending
   - Execute contract function on destination
   - All in a single user signature

3. **Supported Actions**
   - WETH wrapping/unwrapping
   - Token approvals
   - DeFi deposits (AAVE, etc.)
   - Custom contract calls

### Supported Chains

**Source Chain:**

- Ethereum Sepolia (testnet)

**Destination Chains:**

- Base Sepolia
- Arbitrum Sepolia
- Optimism Sepolia
- Polygon Amoy

## 💡 Intent-Based Interactions

Avail Nexus is built around **intents** — declarative statements of what you want to achieve crosschain, without worrying about the implementation details.

### Example Intent Flow

**User Action:** "Bridge 0.1 USDC from Sepolia to Base and approve spending"

**What Happens:**

1. User configures workflow node with destination, token, amount, contract
2. SDK creates a single **intent** with all steps
3. User approves ONE signature in MetaMask
4. Nexus handles:
   - Source chain transaction
   - Crosschain bridging
   - Destination chain approval
   - Contract execution
5. Intent tracked on [Nexus Explorer](https://explorer.nexus-folly.availproject.org)

**Real Transaction Example:**

- **Intent**: https://explorer.nexus-folly.availproject.org/intent/426
- **Approval tx**: https://sepolia.basescan.org/tx/0x106e0a584cf8583c5a46d9fea04ab68cabeff5c7f03710c3f86a20f144844283
- **Execute tx**: https://sepolia.basescan.org/tx/0xa18b66fe7ed3a1ece5668f7f278dd71fb9870708d11da7197ebcaa6441d6c3c8

### Why Intents?

- **Unified UX**: One signature instead of multiple transactions
- **Chain abstraction**: Users don't manage network switching
- **Failure recovery**: Nexus handles failed crosschain transactions
- **Gas optimization**: Efficient execution across chains

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Testnet ETH and USDC on Ethereum Sepolia

### Installation

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd LinkedOut
   ```

2. **Install frontend dependencies:**

   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables:**

   Create `frontend/.env.local`:

   ```bash
   # Optional: WalletConnect Project ID (for additional wallet connectors)
   # Get from https://cloud.walletconnect.com/
   # NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

   # Backend API (optional, for workflow storage)
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

   > **Note:** WalletConnect is optional. MetaMask works without it.

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

### Get Testnet Tokens

**Sepolia ETH:**

- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

**Sepolia USDC:**

- https://faucet.circle.com/
- Request 10 USDC for testing

## 🧪 Testing Avail Bridge & Execute

### Test 1: Simple USDC Bridge

1. Navigate to http://localhost:3000/workflow
2. Connect MetaMask to **Ethereum Sepolia**
3. Add an **"Avail Bridge"** node
4. Configure:
   - **Destination**: Base Sepolia
   - **Token**: USDC
   - **Amount**: 0.1
5. Click **"Execute Workflow"**
6. Approve MetaMask signature (one-time Chain Abstraction setup)
7. Approve transaction
8. Track your intent on Nexus Explorer (link in console)
9. Wait 10-15 minutes for completion

### Test 2: Bridge & Execute (USDC Approval)

1. Add an **"Avail Bridge & Execute"** node
2. **Bridge Configuration:**
   - **Destination**: Base Sepolia
   - **Token**: USDC
   - **Amount**: 0.1
3. **Execute Configuration:**
   - **Contract**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (USDC on Base)
   - **Function**: `approve`
   - **Parameters**: `["0xYourAddress", "100000"]`
   - **Value**: 0
4. Execute workflow
5. Observe:
   - Bridge transaction
   - Automatic token approval on Base
   - Contract execution on Base
   - All in ONE intent!

### Test 3: WETH Wrapping (ETH only)

1. Add **"Avail Bridge & Execute"** node
2. **Bridge Configuration:**
   - **Destination**: Base Sepolia
   - **Token**: ETH
   - **Amount**: 0.001
3. **Execute Configuration:**
   - **Contract**: `0x4200000000000000000000000000000000000006` (WETH)
   - **Function**: `deposit`
   - **Parameters**: `[]`
   - **Value**: 0.001
4. Execute workflow
5. Result: ETH bridged and wrapped to WETH on Base Sepolia

## 📁 Project Structure

```
LinkedOut/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── workflow/           # Workflow builder UI
│   │   │       ├── page.tsx        # Main workflow page
│   │   │       └── workflowComponents/
│   │   │           ├── AvailBridgeNode.tsx          # Bridge node UI
│   │   │           ├── AvailBridgeExecuteNode.tsx   # Bridge & Execute UI
│   │   │           └── AvailExecutorWagmi.tsx       # Workflow executor
│   │   ├── lib/
│   │   │   └── avail/
│   │   │       ├── nexusClient.ts      # Nexus SDK initialization
│   │   │       ├── bridgeExecutor.ts   # Bridge operations
│   │   │       └── intents.ts          # Intent helpers
│   │   └── providers/
│   │       └── Web3Provider.tsx        # Wagmi + ConnectKit setup
│   └── package.json                    # Nexus SDK dependency
├── backend/                            # Express API for workflow storage
└── README.md
```

## 🔧 Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Blockchain**: Wagmi, Viem, ConnectKit
- **Crosschain**: Avail Nexus Core SDK
- **Styling**: Tailwind CSS
- **Backend**: Express.js, SQLite (optional)

## 🎨 Unique Features

### 1. **Visual Workflow Builder**

Unlike typical bridge UIs, LinkedOut allows users to compose complex workflows:

- Combine bridging with AI agents
- Add conditional logic (if/else)
- Chain multiple crosschain operations
- Save and reuse workflows

### 2. **Contract ABI Library**

Built-in support for common protocols:

- WETH (wrapping/unwrapping)
- ERC20 tokens (approve, transfer)
- AAVE (deposits)
- Extensible for custom contracts

### 3. **Real-time Execution Logs**

See exactly what's happening:

- Chain detection
- Intent creation
- Approval status
- Transaction hashes
- Explorer links

### 4. **AI Integration Ready**

Workflows can include:

- AI agents for decision-making
- Conditional execution based on chain state
- Automated portfolio rebalancing
- Natural language workflow generation

## 🐛 Troubleshooting

### "Please connect your wallet"

- Click "Connect Wallet" in header
- Approve MetaMask connection
- Refresh page if needed

### "No ABI found for contract"

- Check contract address is correct
- Currently supported: WETH, USDC, AAVE Pool
- Add custom ABIs in `bridgeExecutor.ts`

### Bridge takes too long

- Crosschain bridges take 10-15 minutes
- Check intent status on Nexus Explorer
- Verify source chain has sufficient gas

### WalletConnect errors

- WalletConnect is optional
- MetaMask works without it
- Comment out `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in `.env.local`

## 📚 Resources

- **Avail Nexus Docs**: https://www.availproject.org/
- **Nexus SDK GitHub**: https://github.com/availproject/nexus-sdk
- **Nexus Explorer**: https://explorer.nexus-folly.availproject.org
- **Demo App**: Included in `avail-nexus-demo/` folder

## 🎯 Hackathon Criteria Met

✅ **Uses @avail-project/nexus-core**: Programmatic SDK for browser-based crosschain logic

✅ **Crosschain liquidity sharing**: Bridge USDC, ETH between Sepolia and L2 testnets

✅ **Crosschain execution**: Bridge & execute contracts on destination chain (WETH, AAVE, etc.)

✅ **Intent-based interactions**: All operations use `nexusClient.bridge()` and `nexusClient.bridgeAndExecute()` intents

✅ **Real transactions**: Live testnet demos with verifiable intent IDs

✅ **Clear integration docs**: This README explains SDK usage, architecture, and testing

## 📝 License

MIT License - Feel free to use this project as a reference or starting point for your own Nexus integrations!

## 🤝 Contributing

Contributions welcome! Feel free to:

- Add support for more chains
- Integrate additional contract ABIs
- Improve workflow UI/UX
- Add more AI agent capabilities

---

**Built with ❤️ using Avail Nexus SDK**
