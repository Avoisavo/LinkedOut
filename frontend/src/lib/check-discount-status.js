import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import crypto from "crypto";

const BaseNamesRegistrarControllerAddress = "0x49aE3cC2e3AA768B1e5654f5D3C6002144A59581";

const TESTNET_DISCOUNT_KEY = "0x" + crypto.createHash("sha256")
  .update("testnet.discount.validator")
  .digest("hex");

const registrarABI = [
  {
    inputs: [
      { internalType: "bytes32", name: "key", type: "bytes32" },
    ],
    name: "discounts",
    outputs: [
      { internalType: "bool", name: "active", type: "bool" },
      { internalType: "address", name: "discountValidator", type: "address" },
      { internalType: "bytes32", name: "key", type: "bytes32" },
      { internalType: "uint256", name: "discount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "registrant", type: "address" },
    ],
    name: "discountedRegistrants",
    outputs: [
      { internalType: "bool", name: "hasRegisteredWithDiscount", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

console.log(`Discount Key: ${TESTNET_DISCOUNT_KEY}\n`);

// Check discount details
const discountDetails = await client.readContract({
  address: BaseNamesRegistrarControllerAddress,
  abi: registrarABI,
  functionName: "discounts",
  args: [TESTNET_DISCOUNT_KEY],
});

console.log("Discount Details:");
console.log("  Active:", discountDetails[0]);
console.log("  Validator:", discountDetails[1]);
console.log("  Key:", discountDetails[2]);
console.log("  Discount Amount:", discountDetails[3].toString(), "wei");
console.log();

// Check if address has already used discount
const walletAddress = "0x99a0F8EC5f50a3d7aC1BF8253A955a7149713349";
const hasUsedDiscount = await client.readContract({
  address: BaseNamesRegistrarControllerAddress,
  abi: registrarABI,
  functionName: "discountedRegistrants",
  args: [walletAddress],
});

console.log("Wallet Discount Status:");
console.log("  Address:", walletAddress);
console.log("  Already used discount:", hasUsedDiscount);


