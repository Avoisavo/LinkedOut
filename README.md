# LinkedOut - AI-Powered Crosschain Workflow Automation

**LinkedOut** is an intelligent workflow automation platform that transforms natural language prompts into executable crosschain workflows. Users can describe what they want to achieve in plain English, and AI generates a visual workflow that bridges tokens, executes smart contracts, and automates multi-agent interactions across multiple blockchains.

## 🎯 Problem Statement

Building and executing crosschain workflows is complex and inaccessible:

- **Fragmented Tools**: Users need separate interfaces for bridging, DeFi interactions, and agent communication
- **Technical Barriers**: Setting up crosschain operations requires deep blockchain knowledge
- **No Automation**: Multi-step workflows require manual execution of each transaction
- **Poor UX**: Switching between chains, wallets, and dApps creates friction
- **Limited Composability**: Existing solutions don't easily combine DeFi, bridging, and AI agents

**The Result**: Users struggle to execute complex crosschain strategies, limiting blockchain adoption.

## 💡 Solution

LinkedOut solves this with **AI-powered workflow generation** and **unified crosschain execution**:

1. **Natural Language Interface**: Users describe their intent in plain English
2. **AI Flow Generation**: Large language models translate prompts into visual workflows
3. **One-Click Execution**: All steps execute automatically with a single user approval
4. **Crosschain Abstraction**: Seamlessly bridge and execute across Ethereum, Base, Arbitrum, Optimism, Polygon, and Hedera
5. **Agent Coordination**: Hedera A2A protocol enables autonomous agent-to-agent communication
6. **Intent-Based Bridging**: Avail Nexus SDK handles complex crosschain operations in a single transaction

**Example Workflow**:
> "Bridge 100 USDC from Ethereum to Base and deposit into AAVE"

LinkedOut generates a workflow that:
- Bridges USDC using Avail Nexus or LayerZero
- Approves AAVE spending on Base
- Deposits tokens into lending pool
- Notifies user of completion

All in **one signature**.

## 🚀 How We Built This

### The Journey

We started with a fundamental question: **"How can we make crosschain DeFi accessible to everyone?"**

**Phase 1 - Visual Workflow Builder**: Built a drag-and-drop interface for composing blockchain actions (inspired by Zapier/n8n)

**Phase 2 - AI Integration**: Added natural language processing using Groq's Llama models to generate workflows from text prompts

**Phase 3 - Crosschain Infrastructure**:
- Integrated **Avail Nexus SDK** for intent-based bridging between Ethereum L1 and L2s
- Deployed **LayerZero OFT contracts** for Base ↔ Hedera bridging
- Implemented **Hedera A2A protocol** for agent-to-agent communication

**Phase 4 - Agent System**: Built autonomous agents (Telegram, AI Decision, Bridge Executor) that coordinate via Hedera Consensus Service

**Phase 5 - User Testing**: Refined UX based on real testnet transactions and user feedback

### Key Innovation

The **AI + Agent + Bridge** combination is unique:
- AI understands user intent and validates parameters
- Agents coordinate execution using blockchain-native messaging (Hedera HCS)
- Multiple bridge protocols (Avail, LayerZero) provide flexibility and redundancy

This creates a **self-executing crosschain workflow engine** that feels like magic to users.

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

Before you begin, ensure you have:

- **Node.js 18+** and npm installed
- **MetaMask** browser extension (or compatible Web3 wallet)
- **Testnet tokens**:
  - Sepolia ETH (for gas fees)
  - Sepolia USDC (for bridging)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/LinkedOut.git
cd LinkedOut
```

#### 2. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd ../backend/api
npm install
```

#### 3. Set Up Environment Variables

**Backend** (`backend/api/.env`):
```bash
# Hedera Agent Accounts
HEDERA_TELEGRAM_ACCOUNT_ID=0.0.7130534
HEDERA_TELEGRAM_PRIVATE_KEY=your_private_key

HEDERA_AI_ACCOUNT_ID=0.0.7130657
HEDERA_AI_PRIVATE_KEY=your_private_key

HEDERA_BRIDGE_ACCOUNT_ID=0.0.7130832
HEDERA_BRIDGE_PRIVATE_KEY=your_private_key

# Hedera Consensus Service
HCS_TOPIC_ID=0.0.7131514

# Auto-start agents (optional)
AUTO_START_AGENTS=false

# Groq API (for AI workflow generation)
GROQ_API_KEY=your_groq_api_key
```

**Frontend** (`frontend/.env.local`):
```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: WalletConnect Project ID
# Get from https://cloud.walletconnect.com/
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Groq API (for prompt processing)
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key
```

> **Note:** WalletConnect is optional. MetaMask works without it.

#### 4. Get Testnet Tokens

**Sepolia ETH** (for gas):
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

**Sepolia USDC** (for bridging):
- https://faucet.circle.com/
- Request 10 USDC for testing

**Base Sepolia ETH** (optional):
- https://www.alchemy.com/faucets/base-sepolia

#### 5. Start the Application

Open **two terminals**:

**Terminal 1 - Backend:**
```bash
cd backend/api
node server.js
```
The backend will start on `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:3000`

#### 6. Connect Your Wallet

1. Open http://localhost:3000 in your browser
2. Click **"Connect Wallet"** in the header
3. Approve MetaMask connection
4. Switch to **Ethereum Sepolia** network

### Quick Start Script (Optional)

Use the provided script to start both frontend and backend:

```bash
chmod +x run_app.sh
./run_app.sh
```

This will automatically:
- Start the backend on port 8000
- Start the frontend on port 3000
- Open your browser to http://localhost:3000

## 🧪 How to Use

### Option 1: AI-Powered Workflow Generation (Recommended)

**Step 1 - Enter Prompt:**
1. Open http://localhost:3000
2. Click **"Start"** button
3. Type your workflow request:
   ```
   Bridge 100 USDC from Ethereum to Base and deposit into AAVE
   ```
4. Click **"Generate Workflow"**

**Step 2 - Review Generated Flow:**
- AI creates visual workflow with nodes
- Each node shows configuration (chain, token, amount, contract)
- Edit any parameters if needed
- Preview execution order

**Step 3 - Execute:**
1. Click **"Execute Workflow"**
2. Approve MetaMask prompts:
   - One-time Chain Abstraction setup (Nexus SDK)
   - Transaction approvals
3. Watch real-time logs:
   ```
   ✓ Initializing Nexus SDK...
   ✓ Creating bridge intent...
   ⏳ Intent ID: 426 (view on explorer)
   ✓ Bridge successful!
   ✓ Executing contract on Base...
   ✅ Workflow completed!
   ```

**Example Prompts to Try:**
- "Bridge 0.1 USDC from Ethereum to Base"
- "Bridge 50 USDC to Arbitrum and approve spending for AAVE"
- "Wrap 0.01 ETH to WETH on Base"
- "Bridge 100 USDC from Ethereum to Polygon"

### Option 2: Manual Workflow Builder

**Step 1 - Build Workflow:**
1. Navigate to http://localhost:3000/flow
2. Click **"+ Add Node"**
3. Choose node type:
   - **Start Node** (trigger)
   - **Avail Bridge** (simple bridge)
   - **Avail Bridge & Execute** (bridge + contract call)
   - **Hedera Agent** (agent communication)
   - **AI Agent** (decision making)
   - **If/Else** (conditional logic)

**Step 2 - Configure Nodes:**
- Click on each node to open config panel
- Set parameters (chains, tokens, amounts, addresses)
- Connect nodes by dragging between them

**Step 3 - Execute:**
- Click **"Execute Workflow"**
- Approve MetaMask transactions
- Monitor progress in real-time

### Option 3: Hedera Agent System

**Step 1 - Start Agents:**
1. Open http://localhost:3000/flow
2. Add **"Hedera Agent System"** node
3. Click **"▶️ Start Agents"**
4. Wait 5-10 seconds for initialization
5. Status changes to **🟢 Online**

**Step 2 - Send Message:**
1. Type in message box:
   ```
   Bridge 100 USDC from Ethereum to Polygon
   ```
2. Click **"📤 Send Message"**

**Step 3 - Watch Agent Communication:**
- **Telegram Agent** receives message → sends to AI Agent
- **AI Agent** validates request → approves/rejects
- **Bridge Executor** creates execution plan
- Notification appears with decision

**Step 4 - View On-Chain Messages:**
- Open https://hashscan.io/testnet/topic/0.0.7131514
- See all agent messages published to HCS
- Verify `AI_DECISION_REQ`, `BRIDGE_EXEC_REQ`, `NOTIFY`

## 🧪 Testing Examples

### Test 1: Simple USDC Bridge (Avail Nexus)

**Prerequisites**: Sepolia USDC balance

1. Navigate to http://localhost:3000/prompt
2. Enter: `"Bridge 0.1 USDC from Ethereum to Base"`
3. AI generates workflow → Click **"Execute"**
4. Approve MetaMask signature (one-time setup)
5. Approve bridge transaction
6. Track intent: https://explorer.nexus-folly.availproject.org
7. Wait 10-15 minutes for completion

**Expected Result**:
- Intent created on Nexus
- USDC bridged from Sepolia to Base Sepolia
- Transaction visible on BaseScan

### Test 2: Bridge & Execute (AAVE Deposit)

**Prerequisites**: Sepolia USDC, AAVE knowledge

1. Prompt: `"Bridge 0.1 USDC to Base and deposit into AAVE"`
2. AI generates:
   - Avail Bridge node (Sepolia → Base)
   - Avail Bridge & Execute node (approve + deposit)
3. Execute workflow
4. Observe:
   - ✅ Bridge transaction on Sepolia
   - ✅ USDC approval on Base (auto-executed)
   - ✅ AAVE deposit on Base (auto-executed)
   - All in **ONE** Nexus intent!

**Verification**:
- Approval tx: https://sepolia.basescan.org/tx/{hash}
- Deposit tx: https://sepolia.basescan.org/tx/{hash}
- Intent: https://explorer.nexus-folly.availproject.org/intent/{id}

### Test 3: Hedera Agent Workflow

**Prerequisites**: Backend running with agents started

1. Add **"Hedera Agent System"** node
2. Start agents via UI button
3. Send message: `"Bridge 100 USDC from Ethereum to Polygon"`
4. Wait 10-15 seconds (agents communicating via HCS)
5. Notification appears:
   ```
   ✅ AI Decision: APPROVED
   Parameters extracted:
   - Source: Ethereum
   - Destination: Polygon
   - Token: USDC
   - Amount: 100
   
   Bridge execution plan created. Ready to execute.
   ```

**Verification**:
- Check HCS topic: https://hashscan.io/testnet/topic/0.0.7131514
- See messages: `AI_DECISION_REQ` → `AI_DECISION_RESP` → `BRIDGE_EXEC_REQ`

### Test 4: LayerZero Base ↔ Hedera Bridge

**Prerequisites**: Base Sepolia ETH, deployed contracts

1. Navigate to http://localhost:3000/flow
2. Add **"Base Bridge"** node
3. Configure:
   - **Source**: Base Sepolia
   - **Destination**: Hedera Testnet
   - **Token**: OFT Token
   - **Amount**: 1.0
4. Execute → Approve MetaMask
5. LayerZero processes bridge:
   - Source tx on Base Sepolia
   - Verification by DVN
   - Destination mint on Hedera

**Verification**:
- Base tx: https://sepolia.basescan.org/tx/{hash}
- Hedera tx: https://hashscan.io/testnet/transaction/{hash}
- LayerZero scan: https://testnet.layerzeroscan.com/

### Test 5: WETH Wrapping on Base

**Prerequisites**: Sepolia ETH

1. Prompt: `"Bridge 0.001 ETH to Base and wrap as WETH"`
2. AI generates Bridge & Execute workflow
3. Execute → ONE signature
4. Result:
   - ETH bridged to Base Sepolia
   - Automatically wrapped to WETH
   - WETH balance updated

**Contract**: `0x4200000000000000000000000000000000000006` (WETH on Base)

## 📁 Project Structure

```
LinkedOut/
├── frontend/                           # Next.js 15 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Landing page (3D animation)
│   │   │   ├── prompt/                # AI prompt input page
│   │   │   └── flow/                  # Visual workflow builder
│   │   │       ├── page.tsx           # Main canvas
│   │   │       ├── aiNode/            # AI agent nodes
│   │   │       ├── availNode/         # Avail bridge nodes
│   │   │       ├── baseNode/          # Base chain nodes
│   │   │       ├── hederaNode/        # Hedera agent nodes
│   │   │       └── panel/             # Configuration panels
│   │   ├── avail/                     # Avail Nexus components
│   │   │   ├── AvailBridgeNode.tsx
│   │   │   ├── AvailBridgeExecuteNode.tsx
│   │   │   └── AvailExecutorWagmi.tsx
│   │   ├── lib/
│   │   │   ├── avail/
│   │   │   │   ├── nexusClient.ts     # Nexus SDK init
│   │   │   │   ├── bridgeExecutor.ts  # Bridge operations
│   │   │   │   └── intents.ts         # Intent tracking
│   │   │   ├── bridgeToHedera.ts      # LayerZero bridge
│   │   │   └── wagmi-config.ts        # Wallet connection
│   │   └── providers/
│   │       └── Web3Provider.tsx       # Wagmi + RainbowKit
│   └── package.json                   # Dependencies
│
├── backend/
│   ├── api/                           # Express backend
│   │   ├── server.js                  # Main server
│   │   ├── hedera/
│   │   │   └── a2a-protocol.js        # A2A message schemas
│   │   ├── hedera-kit/
│   │   │   ├── agent-system.js        # Agent orchestrator
│   │   │   ├── telegram-kit-agent.js  # Telegram agent
│   │   │   ├── ai-decision-kit-agent.js  # AI agent
│   │   │   ├── bridge-executor-kit-agent.js  # Bridge agent
│   │   │   └── test-workflow.js       # Test suite
│   │   ├── routes/
│   │   │   ├── agents.js              # Agent API endpoints
│   │   │   ├── workflows.js           # Workflow CRUD
│   │   │   └── templates.js           # Template management
│   │   ├── models/                    # Database models
│   │   └── db/
│   │       └── database.js            # SQLite connection
│   │
│   └── base/                          # LayerZero contracts
│       ├── contracts/
│       │   ├── ConditionalBridge.sol  # Custom OFT
│       │   └── MyOFT.sol              # Standard OFT
│       ├── deployments/
│       │   ├── base-sepolia/          # Base deployments
│       │   └── hedera-testnet/        # Hedera deployments
│       ├── scripts/
│       │   ├── bridge-to-hedera.js    # Bridge script
│       │   └── check-balances.js      # Balance checker
│       └── hardhat.config.ts          # Hardhat config
│
├── HEDERA_AGENT_WORKFLOW.md          # Agent documentation
├── AVAIL_BRIDGE_GUIDE.md              # Avail integration guide
├── QUICK_START.md                     # Quick start tutorial
└── README.md                          # This file
```

## 🔧 Technical Stack

### Frontend
- **Framework**: Next.js 15 (React 19, TypeScript)
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **Blockchain**: Wagmi v2, Viem, Ethers v6, RainbowKit
- **Styling**: Tailwind CSS 4
- **AI**: Groq API (Llama 3)

### Backend
- **Server**: Express.js
- **Database**: SQLite3 (Better-SQLite3)
- **AI/LLM**: LangChain, Groq API, OpenAI-compatible endpoints
- **Hedera**: Hedera Agent Kit v3.4.0, @hashgraph/sdk v2

### Blockchain Integrations

#### Crosschain Bridging
- **Avail Nexus SDK** (`@avail-project/nexus-core` v0.0.2)
  - Intent-based bridging between Ethereum Sepolia and L2 testnets
  - Supports: Base Sepolia, Arbitrum Sepolia, Optimism Sepolia, Polygon Amoy
  - Bridge & Execute in one transaction

- **LayerZero V2**
  - OFT (Omnichain Fungible Token) contracts deployed on Base Sepolia and Hedera Testnet
  - Handles Base ↔ Hedera token bridging
  - Uses LayerZero DVN (Decentralized Verifier Network)

#### Hedera Integration
- **Hedera Consensus Service (HCS)**: Topic 0.0.7131514
- **A2A Protocol**: Custom Agent-to-Agent message protocol
- **Agents**:
  - Telegram Agent (ID: 0.0.7130534)
  - AI Decision Agent (ID: 0.0.7130657)
  - Bridge Executor Agent (ID: 0.0.7130832)

#### Supported Networks
- Ethereum Sepolia (testnet)
- Base Sepolia (testnet) - **Base blockchain integration**
- Arbitrum Sepolia (testnet)
- Optimism Sepolia (testnet)
- Polygon Amoy (testnet)
- Hedera Testnet

### Smart Contracts
- **ConditionalBridge.sol**: LayerZero OFT contract with conditional bridging logic
- **MyOFT.sol**: Standard LayerZero OFT token implementation
- Deployed on Base Sepolia and Hedera Testnet with verified contracts

## 👤 User Flow: From Prompt to Execution

LinkedOut provides a seamless journey from natural language input to crosschain execution:

### Step 1: User Enters Prompt
**Location**: `/prompt` page

User types a natural language request:
```
"Bridge 100 USDC from Ethereum to Base and deposit into AAVE"
```

**What Happens**:
- User input is validated for basic structure
- Redirected to workflow builder with prompt parameter

### Step 2: AI Processes Prompt
**Location**: `/flow` page (workflow builder)

**AI Processing Pipeline**:
```
User Prompt → Groq API (Llama 3) → Workflow JSON → Visual Flow
```

**AI Actions**:
1. **Parse Intent**: Identifies "bridge" + "deposit" operations
2. **Extract Parameters**: 
   - Source: Ethereum
   - Destination: Base
   - Token: USDC
   - Amount: 100
   - Action: AAVE deposit
3. **Generate Workflow JSON**: Creates node structure with configuration
4. **Validate**: Checks for supported chains, tokens, and contracts

**Generated Workflow**:
- **Start Node**: Trigger point
- **Avail Bridge Node**: Bridge 100 USDC (Ethereum → Base)
- **Avail Bridge & Execute Node**: Approve + deposit into AAVE on Base
- **End Node**: Completion

### Step 3: User Reviews Generated Flow
**Visual Workflow Builder**:
- Nodes appear on canvas with connections
- User can:
  - Edit node parameters (amount, addresses, etc.)
  - Add/remove nodes
  - Rearrange workflow
  - Save for later use

### Step 4: User Executes Workflow
**Execution Button Clicked**:

#### 4.1 Initialization
```javascript
// Connect wallet (MetaMask)
connectWallet() → userAddress

// Initialize Avail Nexus SDK (one-time)
await NexusSDK.init({ wallet: provider })
// User signs Chain Abstraction account setup
```

#### 4.2 Sequential Node Execution

**For Avail Bridge Nodes**:
```
Execute Node → nexusClient.bridge({
  chainId: destinationChainId,
  token: "USDC",
  amount: "100"
}) → Intent Created → Transaction Submitted
```

**For Avail Bridge & Execute Nodes**:
```
Execute Node → nexusClient.bridgeAndExecute({
  toChainId: destinationChainId,
  token: "USDC",
  amount: "100",
  execute: {
    contractAddress: "0x...",
    contractAbi: [...],
    functionName: "deposit",
    buildFunctionParams: (token, amount) => ({
      functionParams: [token, amount, user],
      value: "0"
    })
  }
}) → Intent Created → Bridge + Approval + Execute
```

**For Hedera Nodes** (uses A2A Protocol):
```
Execute Node → POST /api/agents/telegram/message
{
  text: "Bridge 100 USDC from Ethereum to Polygon",
  chatId: workflowId,
  userId: userAddress
}

→ Hedera Telegram Agent receives message
→ Sends AI_DECISION_REQ to AI Decision Agent via HCS
→ AI Agent validates request
  ├─ Valid → Sends BRIDGE_EXEC_REQ to Bridge Executor Agent
  │          └─ Returns execution plan to frontend
  └─ Invalid → Sends NOTIFY with rejection reason

→ Frontend polls /api/agents/telegram/notifications
→ Displays result to user
```

### Step 5: Hedera A2A Execution (for Hedera nodes)

**Agent-to-Agent Communication via Hedera Consensus Service**:

```
┌──────────────────────────────────────────────────────────┐
│  1. Telegram Agent (Entry Point)                         │
│     - Receives user message via REST API                 │
│     - Creates AI_DECISION_REQ message                    │
│     - Publishes to HCS Topic 0.0.7131514                 │
└──────────────────┬───────────────────────────────────────┘
                   │ HCS Message
                   ↓
┌──────────────────────────────────────────────────────────┐
│  2. AI Decision Agent (Brain)                            │
│     - Subscribes to HCS Topic                            │
│     - Receives AI_DECISION_REQ                           │
│     - Validates request using if/else logic:             │
│       • Checks for bridge keywords                       │
│       • Extracts: sourceChain, targetChain, token, amt   │
│       • Validates against supported chains/tokens        │
│     - Decision:                                          │
│       ✓ APPROVE → Creates BRIDGE_EXEC_REQ                │
│       ✗ REJECT  → Creates NOTIFY with reason             │
│     - Publishes response to HCS                          │
└──────────────────┬───────────────────────────────────────┘
                   │ HCS Message
                   ↓
┌──────────────────────────────────────────────────────────┐
│  3. Bridge Executor Agent (Action)                       │
│     - Receives BRIDGE_EXEC_REQ from HCS                  │
│     - Stores as pending execution with correlationId     │
│     - Creates execution plan:                            │
│       • Source chain transaction                         │
│       • Bridge protocol (LayerZero/Avail)                │
│       • Destination chain execution                      │
│     - Returns BRIDGE_EXEC_RESP (pending status)          │
│     - Publishes to HCS                                   │
└──────────────────┬───────────────────────────────────────┘
                   │ HCS Message
                   ↓
┌──────────────────────────────────────────────────────────┐
│  4. AI Decision Agent (Notification Router)              │
│     - Receives BRIDGE_EXEC_RESP                          │
│     - Creates NOTIFY message with result                 │
│     - Sends to Telegram Agent                            │
│     - Publishes to HCS                                   │
└──────────────────┬───────────────────────────────────────┘
                   │ HCS Message
                   ↓
┌──────────────────────────────────────────────────────────┐
│  5. Telegram Agent (Notification Store)                  │
│     - Receives NOTIFY from HCS                           │
│     - Stores notification in memory (by chatId)          │
│     - Available for frontend polling                     │
└──────────────────────────────────────────────────────────┘
```

**Verification**: All messages are **on-chain and verifiable** at:
`https://hashscan.io/testnet/topic/0.0.7131514`

### Step 6: LayerZero Bridge Execution (for Base ↔ Hedera)

When bridging between Base and Hedera:

```javascript
// Frontend calls backend API
POST /api/bridge/execute
{
  sourceChain: "base-sepolia",
  targetChain: "hedera-testnet",
  amount: "100",
  token: "USDC"
}

→ Backend executes LayerZero OFT bridge:
  1. User approves token spending (MetaMask)
  2. Calls ConditionalBridge.send() on Base Sepolia
  3. LayerZero DVN verifies and relays
  4. Tokens minted on Hedera Testnet
  5. Returns transaction hash + explorer link

→ Frontend displays:
  - Source tx: Base Sepolia explorer
  - Destination tx: Hedera HashScan
  - Bridge status: Completed
```

**Bridge Contracts**:
- Base Sepolia: `deployments/base-sepolia/ConditionalBridge.json`
- Hedera Testnet: `deployments/hedera-testnet/ConditionalBridge.json`

### Step 7: Real-Time Progress Updates

**During Execution**:
- Progress bar shows current node
- Logs display:
  ```
  ✓ Initializing Nexus SDK...
  ✓ Connected to Ethereum Sepolia
  ✓ Creating bridge intent...
  ⏳ Intent ID: 426 (view on explorer)
  ⏳ Waiting for bridge completion...
  ✓ Bridge successful!
  ✓ Executing contract on Base...
  ✓ Approval tx: 0x106e0a...
  ✓ Deposit tx: 0xa18b66...
  ✅ Workflow completed!
  ```

### Step 8: Completion & Verification

**Results Displayed**:
- All transaction hashes with explorer links
- Intent IDs for Avail Nexus operations
- HCS message IDs for Hedera agent communications
- Gas costs and execution time
- Success/failure status per node

**On-Chain Verification**:
- **Avail Nexus**: https://explorer.nexus-folly.availproject.org/intent/{intentId}
- **Base Sepolia**: https://sepolia.basescan.org/tx/{txHash}
- **Hedera HCS**: https://hashscan.io/testnet/topic/0.0.7131514
- **LayerZero**: https://testnet.layerzeroscan.com/

## 🔗 What Did We Use?

### Hedera Integration

**Hedera Agent Kit** - Full implementation of agent-to-agent communication:

✅ **A2A Protocol** (`backend/api/hedera/a2a-protocol.js`)
- Custom message schemas: `AI_DECISION_REQ`, `AI_DECISION_RESP`, `BRIDGE_EXEC_REQ`, `BRIDGE_EXEC_RESP`, `NOTIFY`
- Message validation and correlation tracking
- Agent IDs: `agent://telegram`, `agent://ai-decision`, `agent://bridge-executor`

✅ **Hedera Consensus Service (HCS)**
- Topic ID: `0.0.7131514`
- All agent messages published on-chain
- Verifiable at: https://hashscan.io/testnet/topic/0.0.7131514

✅ **Three Autonomous Agents**:
1. **Telegram Agent** (Account `0.0.7130534`)
   - Entry point for user messages
   - Stores notifications for polling
   
2. **AI Decision Agent** (Account `0.0.7130657`)
   - Validates bridge requests using if/else logic
   - Extracts parameters (chains, tokens, amounts)
   - Approves or rejects with reasoning
   
3. **Bridge Executor Agent** (Account `0.0.7130832`)
   - Receives bridge requests from AI Agent
   - Creates execution plans
   - Tracks pending/completed operations

**Files**: `backend/api/hedera-kit/*.js`, `backend/api/routes/agents.js`

### LayerZero Integration

**LayerZero V2 OFT (Omnichain Fungible Token)** - Base ↔ Hedera bridging:

✅ **Smart Contracts**
- `ConditionalBridge.sol` - Custom OFT with conditional logic
- `MyOFT.sol` - Standard OFT implementation
- Deployed on Base Sepolia AND Hedera Testnet

✅ **Deployment Files**
- Base Sepolia: `backend/base/deployments/base-sepolia/ConditionalBridge.json`
- Hedera Testnet: `backend/base/deployments/hedera-testnet/ConditionalBridge.json`

✅ **Bridge Scripts**
- `backend/base/scripts/bridge-to-hedera.js` - Execute Base → Hedera bridge
- `backend/base/scripts/auto-bridge-base-to-hedera.js` - Automated bridging
- `backend/base/scripts/check-balances.js` - Verify token balances

✅ **LayerZero Configuration**
- `layerzero.config.ts` - Network endpoints and chain IDs
- Uses LayerZero DVN (Decentralized Verifier Network)
- Supports EVM ↔ Hedera cross-chain messaging

**Files**: `backend/base/contracts/*.sol`, `backend/base/scripts/*.js`, `backend/base/deploy/*.ts`

### Avail Nexus Integration

**Avail Nexus Core SDK** (`@avail-project/nexus-core`) - Multi-chain bridging:

✅ **Client Initialization** (`frontend/src/lib/avail/nexusClient.ts`)
```typescript
const nexusClient = await NexusSDK.init({
  wallet: userWalletProvider,
  config: { /* auto-detects source chain */ }
});
```

✅ **Bridge Operations** (`frontend/src/lib/avail/bridgeExecutor.ts`)
- `executeBridge()` - Simple token bridging
- `executeBridgeAndExecute()` - Bridge + contract execution in one intent

✅ **Supported Routes**
- Ethereum Sepolia → Base Sepolia
- Ethereum Sepolia → Arbitrum Sepolia
- Ethereum Sepolia → Optimism Sepolia
- Ethereum Sepolia → Polygon Amoy

✅ **Visual Workflow Nodes**
- `AvailBridgeNode.tsx` - Simple bridge UI
- `AvailBridgeExecuteNode.tsx` - Bridge + execute UI
- `AvailExecutorWagmi.tsx` - Workflow execution engine

✅ **Intent Tracking**
- All operations tracked on Nexus Explorer
- Example intent: https://explorer.nexus-folly.availproject.org/intent/426
- Real transactions with verifiable proof

**Files**: `frontend/src/lib/avail/*.ts`, `frontend/src/app/avail/*.tsx`

### Base Blockchain Integration

**Base Sepolia Testnet** - Primary L2 for crosschain operations:

✅ **LayerZero OFT Deployment**
- ConditionalBridge contract deployed at verified address
- Supports bridging to/from Hedera via LayerZero

✅ **Avail Nexus Destination**
- Base Sepolia is a primary destination chain for Nexus intents
- Supports bridge + execute workflows (e.g., AAVE deposits on Base)

✅ **DeFi Integration**
- WETH contract: `0x4200000000000000000000000000000000000006`
- USDC contract: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- Contract ABIs included in bridgeExecutor for seamless interaction

✅ **Explorer Links**
- All Base transactions link to https://sepolia.basescan.org
- Real-time verification of bridge and execute operations

**Usage Example**:
```
User: "Bridge 0.1 USDC from Ethereum to Base and wrap as WETH"
→ Nexus SDK bridges USDC to Base
→ Auto-approves WETH contract
→ Calls deposit() on WETH contract
→ All in ONE intent!
```

### AI Integration

**Groq API** (Llama 3) - Workflow generation from natural language:

✅ **Prompt Processing** (`frontend/src/app/prompt/`)
- Converts user text into workflow JSON
- Extracts chains, tokens, amounts, actions
- Validates against supported operations

✅ **Backend AI Agent** (Hedera)
- LangChain integration for agent reasoning
- If/else decision logic (no LLM needed for execution)
- Validates bridge requests in real-time

**Files**: `frontend/package.json` (`@langchain/groq`), `backend/api/hedera-kit/ai-decision-kit-agent.js`

## 🎨 Unique Features

### 1. **Natural Language Workflows**
- Describe intent in plain English
- AI generates executable workflow
- Edit visually before execution

### 2. **Multi-Bridge Support**
- Avail Nexus for L1 → L2
- LayerZero for Base ↔ Hedera
- Automatic protocol selection

### 3. **Agent Orchestration**
- Autonomous agents coordinate via Hedera HCS
- On-chain message verification
- Event-driven architecture

### 4. **Intent-Based Execution**
- One signature for multi-step operations
- Bridge + approve + execute in single transaction
- Simplified UX, complex operations

### 5. **Real-time Verification**
- Every action tracked on-chain
- Links to explorers (Nexus, BaseScan, HashScan, LayerZero)
- Transparent execution logs

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

## 🎯 Summary: What Makes LinkedOut Unique

### The Complete Package

LinkedOut is **not just a bridge** — it's a **workflow automation platform** that combines:

1. **AI-Powered Workflow Generation**
   - Natural language → executable workflows
   - No coding required
   - Instant deployment

2. **Multi-Protocol Bridging**
   - **Avail Nexus**: L1 ↔ L2 intent-based bridging
   - **LayerZero V2**: Base ↔ Hedera OFT bridging
   - Automatic protocol selection based on route

3. **Autonomous Agent System**
   - Hedera Agent Kit with A2A protocol
   - On-chain agent communication via HCS
   - Event-driven architecture

4. **Crosschain Execution**
   - Bridge + approve + execute in ONE transaction
   - Contract interactions on destination chains
   - DeFi protocol integration (AAVE, WETH)

5. **Full Transparency**
   - Every step verifiable on-chain
   - Links to multiple explorers
   - Real-time execution logs

### Technologies Demonstrated

✅ **Hedera Integration**
- A2A Protocol with custom message schemas
- Hedera Consensus Service (Topic 0.0.7131514)
- Three autonomous agents (Telegram, AI, Bridge Executor)
- Hedera Agent Kit v3.4.0

✅ **LayerZero Integration**
- OFT contracts deployed on Base Sepolia & Hedera Testnet
- ConditionalBridge.sol with custom logic
- Cross-EVM messaging with DVN verification
- Base ↔ Hedera bridging

✅ **Avail Nexus Integration**
- Nexus Core SDK v0.0.2
- Intent-based bridging (bridge + execute in one)
- Multi-chain support (Ethereum, Base, Arbitrum, Optimism, Polygon)
- Real transactions on testnet

✅ **Base Blockchain**
- Primary L2 destination for Nexus intents
- LayerZero OFT deployment for Hedera bridging
- DeFi integrations (WETH, USDC, AAVE)
- Verified contracts on Base Sepolia

✅ **AI/LLM Integration**
- Groq API (Llama 3) for workflow generation
- LangChain for agent reasoning
- Natural language processing

### Real-World Usage

**Problem**: User wants to "Bridge 100 USDC from Ethereum to Base and deposit into AAVE"

**Traditional Approach** (8+ steps):
1. Open bridge website
2. Bridge USDC (wait 10-15 min)
3. Switch to Base network in MetaMask
4. Find AAVE dApp
5. Approve USDC spending (transaction 1)
6. Deposit into AAVE (transaction 2)
7. Verify each transaction separately
8. Track multiple links

**LinkedOut Approach** (1 step):
1. Type prompt: "Bridge 100 USDC from Ethereum to Base and deposit into AAVE"
2. AI generates workflow
3. Click Execute → ONE signature
4. Everything happens automatically via Avail Nexus intent
5. Done! ✅

**Time saved**: 10+ minutes  
**Transactions**: 1 intent instead of 3+ separate transactions  
**Complexity**: Zero for user

### Verifiable Results

All our demos are **live on testnet** and **fully verifiable**:

- **Avail Nexus Intent**: https://explorer.nexus-folly.availproject.org/intent/426
- **Base Approval tx**: https://sepolia.basescan.org/tx/0x106e0a584cf8583c5a46d9fea04ab68cabeff5c7f03710c3f86a20f144844283
- **Base Execute tx**: https://sepolia.basescan.org/tx/0xa18b66fe7ed3a1ece5668f7f278dd71fb9870708d11da7197ebcaa6441d6c3c8
- **Hedera HCS Topic**: https://hashscan.io/testnet/topic/0.0.7131514

### Future Roadmap

🚧 **Mainnet Deployment**
- Deploy to production networks
- Real USDC/ETH bridging

🚧 **More Protocols**
- Uniswap swaps
- Compound lending
- Curve pools

🚧 **Advanced Agents**
- Market monitoring agents
- Automated rebalancing
- Portfolio management

🚧 **Social Integration**
- Telegram bot for workflow execution
- Discord notifications
- XMTP messaging

## 🎯 Hackathon Criteria

### Hedera Track
✅ **Hedera Agent Kit**: Full implementation of agent-to-agent communication  
✅ **A2A Protocol**: Custom message schemas for workflow coordination  
✅ **HCS Integration**: All messages published to Topic 0.0.7131514  
✅ **Three Agents**: Telegram, AI Decision, Bridge Executor agents  
✅ **Real Testnet Usage**: Verifiable on HashScan

### LayerZero Track
✅ **OFT Contracts**: Deployed on Base Sepolia & Hedera Testnet  
✅ **Cross-EVM Messaging**: Base ↔ Hedera bridging  
✅ **Custom Logic**: ConditionalBridge.sol with validation  
✅ **DVN Verification**: Uses LayerZero security model

### Avail Nexus Track
✅ **Nexus Core SDK**: Full programmatic integration  
✅ **Intent-Based Bridging**: Bridge + execute in one transaction  
✅ **Multi-Chain Support**: Ethereum + 4 L2s  
✅ **Real Transactions**: Verifiable intent IDs on Nexus Explorer

### Base Track
✅ **Smart Contracts**: LayerZero OFT deployed on Base Sepolia  
✅ **DeFi Integration**: WETH, USDC, AAVE contracts  
✅ **Primary Destination**: Base as main L2 for workflows  
✅ **Verified Contracts**: All contracts verified on BaseScan

## 📝 License

MIT License - Feel free to use this project as a reference or starting point for your own Nexus integrations!

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Areas for Contribution

**Blockchain Integrations**:
- Add support for more L2s (Mantle, Scroll, zkSync)
- Integrate additional bridge protocols
- Deploy to mainnet

**Smart Contracts**:
- Create templates for common DeFi operations
- Add more protocol ABIs (Uniswap, Compound, Curve)
- Optimize gas usage

**Agent System**:
- Build new agent types (price monitoring, arbitrage, etc.)
- Improve AI decision logic
- Add more notification channels

**UI/UX**:
- Design new workflow templates
- Improve visual feedback
- Mobile-responsive design

**Documentation**:
- Video tutorials
- Integration guides
- API documentation

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- TypeScript for frontend
- ESLint + Prettier for formatting
- Clear comments for complex logic
- Test before submitting

## 📞 Contact & Support

- **GitHub Issues**: Report bugs or request features
- **Documentation**: See `HEDERA_AGENT_WORKFLOW.md`, `AVAIL_BRIDGE_GUIDE.md`
- **Discord**: Join our community (link TBD)
- **Twitter**: Follow for updates (link TBD)

## 🙏 Acknowledgments

Built with amazing tools and protocols:

- **Hedera** for agent communication via HCS
- **LayerZero** for omnichain bridging
- **Avail** for intent-based crosschain execution
- **Base** for L2 infrastructure
- **Groq** for AI workflow generation
- **LangChain** for agent reasoning
- **Next.js** for the frontend framework
- **Wagmi** and **Viem** for Web3 interactions

Special thanks to all the teams building the future of crosschain infrastructure! 🚀

---

## 📝 License

MIT License - Feel free to use this project as a reference or starting point for your own integrations!

---

**Built with ❤️ by the LinkedOut team**

*Making crosschain DeFi accessible to everyone, one workflow at a time.*

---

### Quick Links

- 🌐 **Live Demo**: http://localhost:3000 (after installation)
- 📚 **Docs**: See project markdown files
- 🔗 **Avail Nexus Explorer**: https://explorer.nexus-folly.availproject.org
- 🔗 **Hedera HCS Topic**: https://hashscan.io/testnet/topic/0.0.7131514
- 🔗 **Base Sepolia Explorer**: https://sepolia.basescan.org
- 🔗 **LayerZero Scan**: https://testnet.layerzeroscan.com

**Ready to build your first crosschain workflow? [Get Started](#-getting-started) →**
