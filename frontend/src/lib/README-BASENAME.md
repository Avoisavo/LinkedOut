# Basename Registration Scripts

This folder contains scripts to register a Basename (Base's ENS naming service) for your wallet.

## Quick Start

### Option 1: I don't have a wallet yet

1. **Create a wallet**:
   ```bash
   node src/lib/create-wallet-for-basename.js
   ```
   This will:
   - Create a new wallet on Base Sepolia (testnet)
   - Save the seed file locally
   - Create a `.env.basename` template
   - Show you the address to fund

2. **Fund your wallet**:
   - Copy the wallet address from the output
   - Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
   - Wait for the transaction to confirm

3. **Configure your basename**:
   ```bash
   # Edit .env.basename and set your desired name
   nano .env.basename
   
   # Change this line:
   BASE_NAME="yourname.basetest.eth"
   # To your desired name, e.g.:
   BASE_NAME="alice.basetest.eth"
   
   # Load the environment variables
   source .env.basename
   ```

4. **Register your basename**:
   ```bash
   node src/lib/registerbasename.js
   ```

### Option 2: I already have a wallet

1. **Set up environment variables**:
   ```bash
   export BASE_NAME="yourname.basetest.eth"
   export WALLET_ID="your-existing-wallet-id"
   export SEED_FILE_PATH="/path/to/your/seed-file.json"
   ```

2. **Make sure your wallet has at least 0.002 ETH**

3. **Run registration**:
   ```bash
   node src/lib/registerbasename.js
   ```

## Files in this folder

- **`create-wallet-for-basename.js`** - Creates a new wallet for basename registration
- **`registerbasename.js`** - Registers a basename for your wallet
- **`basenames.ts`** - TypeScript utilities for basename resolution (for frontend use)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `BASE_NAME` | Your desired basename | `alice.basetest.eth` (testnet) or `alice.base.eth` (mainnet) |
| `WALLET_ID` | Your CDP wallet ID | `123e4567-e89b-12d3-a456-426614174000` |
| `SEED_FILE_PATH` | Path to your wallet seed file | `/Users/you/wallet-seed.json` |

## Network Specific Values

### Base Sepolia (Testnet)
- Basename format: `*.basetest.eth`
- Registrar: `0x49aE3cC2e3AA768B1e5654f5D3C6002144A59581`
- Resolver: `0x6533C94869D28fAA8dF77cc63f9e2b2D6Cf77eBA`
- Get testnet ETH: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### Base Mainnet
- Basename format: `*.base.eth`
- Registrar: `0x4cCb0BB02FCABA27e82a56646E81d8c5bC4119a5`
- Resolver: `0xC6d566A56A1aFf6508b41f6c90ff131615583BCD`
- Costs: ~0.002 ETH + gas

## Common Issues

### "Insufficient funds"
Make sure your wallet has at least 0.002 ETH plus gas fees (usually ~0.0005 ETH total).

### "Name already registered"
Someone else already owns that basename. Try a different name.

### "Invalid name format"
- Must be 3+ characters
- Only lowercase letters, numbers, and hyphens
- Cannot start or end with a hyphen
- Must end with `.basetest.eth` (testnet) or `.base.eth` (mainnet)

### "CDP API key not found"
Download your CDP API key from https://portal.cdp.coinbase.com/ and save it to `~/Downloads/cdp_api_key.json`

## Security

⚠️ **NEVER commit or share**:
- Your CDP API key (`cdp_api_key.json`)
- Your wallet seed file
- Your `.env.basename` or `.env` files

These files are already in `.gitignore`, but double-check before committing!

## For Mainnet Use

To switch to mainnet:

1. Update `create-wallet-for-basename.js`:
   ```javascript
   const networkId = "base-mainnet";
   ```

2. Update `registerbasename.js` with mainnet addresses:
   ```javascript
   const BaseNamesRegistrarControllerAddress = "0x4cCb0BB02FCABA27e82a56646E81d8c5bC4119a5";
   const L2ResolverAddress = "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD";
   const baseNameRegex = /\.base\.eth$/;
   ```

3. Use `.base.eth` instead of `.basetest.eth`

## Learn More

- [Full Registration Guide](../../BASENAME_REGISTRATION_GUIDE.md)
- [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
- [Base Documentation](https://docs.base.org/)
- [Basenames Official Site](https://www.base.org/names)

