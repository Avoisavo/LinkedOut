import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

const BaseNamesRegistrarControllerAddress = "0x49aE3cC2e3AA768B1e5654f5D3C6002144A59581";

const registrarABI = [
  {
    inputs: [],
    name: "getActiveDiscounts",
    outputs: [
      {
        components: [
          { internalType: "bool", name: "active", type: "bool" },
          { internalType: "address", name: "discountValidator", type: "address" },
          { internalType: "bytes32", name: "key", type: "bytes32" },
          { internalType: "uint256", name: "discount", type: "uint256" },
        ],
        internalType: "struct RegistrarController.DiscountDetails[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

console.log("Checking for active discounts on Base Sepolia...\n");

const activeDiscounts = await client.readContract({
  address: BaseNamesRegistrarControllerAddress,
  abi: registrarABI,
  functionName: "getActiveDiscounts",
});

console.log(`Found ${activeDiscounts.length} active discount(s):\n`);

if (activeDiscounts.length === 0) {
  console.log("❌ No active discounts available");
  console.log("\nYou'll need to use the regular register() function without a discount.");
} else {
  activeDiscounts.forEach((discount, index) => {
    console.log(`Discount ${index + 1}:`);
    console.log(`  Active: ${discount.active}`);
    console.log(`  Validator: ${discount.discountValidator}`);
    console.log(`  Key: ${discount.key}`);
    console.log(`  Discount Amount: ${discount.discount.toString()} wei (${Number(discount.discount) / 1e18} ETH)`);
    console.log();
  });
}


