/**
 * Test Negotiation Script
 *
 * Demonstrates all negotiation scenarios:
 * 1. Happy path: Buyer offers → Seller accepts → Payment executes
 * 2. Negotiation: Buyer offers low → Seller counters → Buyer accepts counter
 * 3. Rejection: Buyer offers → Seller declines
 * 4. Idempotency: Duplicate PAYMENT_REQ doesn't double-pay
 *
 * Usage:
 *   node backend/api/hedera/test-negotiation.js [scenario]
 *
 * Scenarios:
 *   happy       - Quick acceptance and payment
 *   negotiate   - Multi-round negotiation
 *   decline     - Seller declines offer
 *   idempotent  - Test duplicate payment handling
 *   all         - Run all scenarios (default)
 */

import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { BuyerAgent } from "./agents/buyer-agent.js";
import { SellerAgent } from "./agents/seller-agent.js";
import { PaymentAgent } from "./agents/payment-agent.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment from root .env file
// Try multiple paths to ensure we find the .env file
const envPaths = [
  join(__dirname, "../../../.env"), // From hedera/ folder
  join(process.cwd(), ".env"), // From current working directory
  "/Users/edw/Desktop/LinkedOut/.env", // Absolute path
];

let envLoaded = false;
for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log(`✅ Loaded environment from: ${envPath}\n`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.error(
    "⚠️  Warning: Could not load .env file from any expected location"
  );
  console.error("Tried paths:", envPaths);
  console.error("\nMake sure .env exists in project root\n");
}

// Verify environment
function checkEnvironment() {
  const required = [
    "HEDERA_BUYER_ACCOUNT_ID",
    "HEDERA_BUYER_PRIVATE_KEY",
    "HEDERA_SELLER_ACCOUNT_ID",
    "HEDERA_SELLER_PRIVATE_KEY",
    "HEDERA_PAYMENT_ACCOUNT_ID",
    "HEDERA_PAYMENT_PRIVATE_KEY",
    "HCS_TOPIC_ID",
    "HTS_TOKEN_ID",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error(
      "\nPlease create .env file in project root (see env.example)"
    );
    console.error("Run: node backend/api/hedera/scripts/create-resources.js");
    process.exit(1);
  }
}

checkEnvironment();

/**
 * Scenario 1: Happy Path
 */
async function testHappyPath() {
  console.log("\n🎯 Scenario 1: Happy Path");
  console.log("=========================================");
  console.log("Buyer offers good price → Seller accepts → Payment\n");

  // Initialize agents
  const seller = new SellerAgent({
    accountId: process.env.HEDERA_SELLER_ACCOUNT_ID,
    privateKey: process.env.HEDERA_SELLER_PRIVATE_KEY,
    topicId: process.env.HCS_TOPIC_ID,
    minPrice: 50,
    idealPrice: 80,
    inventory: { widgets: 100 },
  });

  const buyer = new BuyerAgent({
    accountId: process.env.HEDERA_BUYER_ACCOUNT_ID,
    privateKey: process.env.HEDERA_BUYER_PRIVATE_KEY,
    topicId: process.env.HCS_TOPIC_ID,
    maxPrice: 100,
    paymentTokenId: process.env.HTS_TOKEN_ID,
    sellerAccountId: process.env.HEDERA_SELLER_ACCOUNT_ID,
  });

  const payment = new PaymentAgent({
    accountId: process.env.HEDERA_PAYMENT_ACCOUNT_ID,
    privateKey: process.env.HEDERA_PAYMENT_PRIVATE_KEY,
    topicId: process.env.HCS_TOPIC_ID,
  });

  // Start all agents
  await Promise.all([seller.start(), buyer.start(), payment.start()]);

  // Wait for subscriptions to be ready
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Set up result tracking
  let dealAccepted = false;
  let paymentSuccess = false;

  seller.on("offerAccepted", () => {
    dealAccepted = true;
  });

  buyer.on("paymentSuccess", ({ transactionId, amount }) => {
    paymentSuccess = true;
    console.log(`\n✅ Payment successful! Tx: ${transactionId}`);
  });

  // Buyer makes an attractive offer (75 HBAR - within seller's ideal range)
  console.log("👤 Buyer: Making offer for 10 widgets at 75 HBAR each\n");

  const { correlationId } = await buyer.makeOffer({
    item: "widgets",
    qty: 10,
    unitPrice: 75,
    currency: "HBAR",
  });

  // Wait for negotiation to complete (max 30 seconds)
  console.log("⏳ Waiting for negotiation to complete...\n");

  const timeout = 30000;
  const startTime = Date.now();

  while (!paymentSuccess && Date.now() - startTime < timeout) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Check results
  if (paymentSuccess) {
    console.log("\n✅ Scenario 1: PASSED");
    console.log("   Deal accepted and payment executed successfully\n");
  } else {
    console.log("\n❌ Scenario 1: FAILED");
    console.log("   Payment not completed within timeout\n");
  }

  // Cleanup
  await Promise.all([seller.stop(), buyer.stop(), payment.stop()]);

  return paymentSuccess;
}

/**
 * Scenario 2: Negotiation
 */
async function testNegotiation() {
  console.log("\n🎯 Scenario 2: Multi-Round Negotiation");
  console.log("=========================================");
  console.log("Buyer offers low → Seller counters → Buyer accepts\n");

  const seller = new SellerAgent({
    accountId: process.env.HEDERA_SELLER_ACCOUNT_ID,
    privateKey: process.env.HEDERA_SELLER_PRIVATE_KEY,
    topicId: process.env.HCS_TOPIC_ID,
    minPrice: 60,
    idealPrice: 90,
    inventory: { gadgets: 50 },
  });

  const buyer = new BuyerAgent({
    accountId: process.env.HEDERA_BUYER_ACCOUNT_ID,
    privateKey: process.env.HEDERA_BUYER_PRIVATE_KEY,
    topicId: process.env.HCS_TOPIC_ID,
    maxPrice: 85,
    paymentTokenId: process.env.HTS_TOKEN_ID,
    sellerAccountId: process.env.HEDERA_SELLER_ACCOUNT_ID,
  });

  const payment = new PaymentAgent({
    accountId: process.env.HEDERA_PAYMENT_ACCOUNT_ID,
    privateKey: process.env.HEDERA_PAYMENT_PRIVATE_KEY,
    topicId: process.env.HCS_TOPIC_ID,
  });

  await Promise.all([seller.start(), buyer.start(), payment.start()]);
  await new Promise((resolve) => setTimeout(resolve, 2000));

  let counterReceived = false;
  let paymentSuccess = false;

  buyer.on("message", (msg) => {
    if (msg.type === "COUNTER") {
      counterReceived = true;
    }
  });

  buyer.on("paymentSuccess", () => {
    paymentSuccess = true;
  });

  // Buyer makes a low offer (65 HBAR - above seller's minimum but below ideal)
  console.log("👤 Buyer: Making low offer for 5 gadgets at 65 HBAR each\n");

  await buyer.makeOffer({
    item: "gadgets",
    qty: 5,
    unitPrice: 65,
    currency: "HBAR",
  });

  // Wait for negotiation
  console.log("⏳ Waiting for negotiation rounds...\n");

  const timeout = 30000;
  const startTime = Date.now();

  while (!paymentSuccess && Date.now() - startTime < timeout) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  if (counterReceived && paymentSuccess) {
    console.log("\n✅ Scenario 2: PASSED");
    console.log("   Negotiation occurred and deal was reached\n");
  } else {
    console.log("\n❌ Scenario 2: FAILED");
    console.log(
      `   Counter received: ${counterReceived}, Payment: ${paymentSuccess}\n`
    );
  }

  await Promise.all([seller.stop(), buyer.stop(), payment.stop()]);

  return counterReceived && paymentSuccess;
}

/**
 * Scenario 3: Rejection
 */
async function testRejection() {
  console.log("\n🎯 Scenario 3: Seller Declines");
  console.log("=========================================");
  console.log("Buyer offers extremely low price → Seller declines\n");

  const seller = new SellerAgent({
    accountId: process.env.HEDERA_SELLER_ACCOUNT_ID,
    privateKey: process.env.HEDERA_SELLER_PRIVATE_KEY,
    topicId: process.env.HCS_TOPIC_ID,
    minPrice: 70,
    idealPrice: 100,
    inventory: { premium: 10 },
  });

  const buyer = new BuyerAgent({
    accountId: process.env.HEDERA_BUYER_ACCOUNT_ID,
    privateKey: process.env.HEDERA_BUYER_PRIVATE_KEY,
    topicId: process.env.HCS_TOPIC_ID,
    maxPrice: 50,
    paymentTokenId: process.env.HTS_TOKEN_ID,
    sellerAccountId: process.env.HEDERA_SELLER_ACCOUNT_ID,
  });

  await Promise.all([seller.start(), buyer.start()]);
  await new Promise((resolve) => setTimeout(resolve, 2000));

  let dealDeclined = false;

  buyer.on("dealDeclined", () => {
    dealDeclined = true;
    console.log("\n❌ Deal was declined by seller (as expected)\n");
  });

  // Buyer makes very low offer (30 HBAR - way below minimum)
  console.log("👤 Buyer: Making low offer for 3 premium at 30 HBAR each\n");

  await buyer.makeOffer({
    item: "premium",
    qty: 3,
    unitPrice: 30,
    currency: "HBAR",
  });

  // Wait for decline
  console.log("⏳ Waiting for seller response...\n");

  await new Promise((resolve) => setTimeout(resolve, 10000));

  if (dealDeclined) {
    console.log("✅ Scenario 3: PASSED");
    console.log("   Seller correctly declined unreasonable offer\n");
  } else {
    console.log("❌ Scenario 3: FAILED");
    console.log("   Expected decline message not received\n");
  }

  await Promise.all([seller.stop(), buyer.stop()]);

  return dealDeclined;
}

/**
 * Scenario 4: Idempotency Test
 */
async function testIdempotency() {
  console.log("\n🎯 Scenario 4: Payment Idempotency");
  console.log("=========================================");
  console.log("Send duplicate PAYMENT_REQ → Should not double-pay\n");

  const payment = new PaymentAgent({
    accountId: process.env.HEDERA_PAYMENT_ACCOUNT_ID,
    privateKey: process.env.HEDERA_PAYMENT_PRIVATE_KEY,
    topicId: process.env.HCS_TOPIC_ID,
  });

  await payment.start();
  await new Promise((resolve) => setTimeout(resolve, 2000));

  let paymentCount = 0;

  payment.on("paymentExecuted", () => {
    paymentCount++;
  });

  // Create a fake payment request
  const { createPaymentReqMessage } = await import("./a2a-protocol.js");

  const testCorrelationId = "test-idempotency-" + Date.now();
  const paymentReq = createPaymentReqMessage(
    "agent://buyer",
    "agent://payment",
    10,
    process.env.HTS_TOKEN_ID,
    process.env.HEDERA_SELLER_ACCOUNT_ID,
    "Test idempotency",
    "test-item",
    1,
    testCorrelationId
  );

  console.log("💳 Sending first payment request...\n");
  await payment.transport.publishMessage(paymentReq);

  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("💳 Sending duplicate payment request...\n");
  await payment.transport.publishMessage(paymentReq);

  await new Promise((resolve) => setTimeout(resolve, 5000));

  if (paymentCount === 1) {
    console.log("\n✅ Scenario 4: PASSED");
    console.log("   Payment executed only once (idempotency working)\n");
  } else {
    console.log(`\n❌ Scenario 4: FAILED`);
    console.log(`   Payment executed ${paymentCount} times (expected 1)\n`);
  }

  await payment.stop();

  return paymentCount === 1;
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log("\n🧪 Running All Test Scenarios");
  console.log("==========================================\n");

  const results = {
    happyPath: await testHappyPath(),
  };

  // Wait between tests to allow message queues to settle
  await new Promise((resolve) => setTimeout(resolve, 3000));

  results.negotiation = await testNegotiation();
  await new Promise((resolve) => setTimeout(resolve, 3000));

  results.rejection = await testRejection();
  await new Promise((resolve) => setTimeout(resolve, 3000));

  results.idempotency = await testIdempotency();

  console.log("\n📊 Test Results Summary");
  console.log("==========================================");
  console.log(`✅ Happy Path:      ${results.happyPath ? "PASSED" : "FAILED"}`);
  console.log(
    `✅ Negotiation:     ${results.negotiation ? "PASSED" : "FAILED"}`
  );
  console.log(`✅ Rejection:       ${results.rejection ? "PASSED" : "FAILED"}`);
  console.log(
    `✅ Idempotency:     ${results.idempotency ? "PASSED" : "FAILED"}`
  );

  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;

  console.log(`\n${passedCount}/${totalCount} tests passed\n`);

  if (passedCount === totalCount) {
    console.log("🎉 All tests passed!\n");
  } else {
    console.log("⚠️  Some tests failed. Check logs above.\n");
  }
}

// Parse command line arguments
const scenario = process.argv[2] || "all";

switch (scenario.toLowerCase()) {
  case "happy":
    testHappyPath()
      .then(() => process.exit(0))
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
    break;
  case "negotiate":
    testNegotiation()
      .then(() => process.exit(0))
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
    break;
  case "decline":
    testRejection()
      .then(() => process.exit(0))
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
    break;
  case "idempotent":
    testIdempotency()
      .then(() => process.exit(0))
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
    break;
  case "all":
  default:
    runAllTests()
      .then(() => process.exit(0))
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
}
