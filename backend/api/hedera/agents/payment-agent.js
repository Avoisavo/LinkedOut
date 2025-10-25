/**
 * Payment Agent
 *
 * Executes HTS token transfers in response to PAYMENT_REQ messages.
 * Maintains idempotency to prevent duplicate payments.
 */

import { BaseAgent } from "./base-agent.js";
import {
  TransferTransaction,
  TokenId,
  AccountId,
  Hbar,
  HbarUnit,
} from "@hashgraph/sdk";
import {
  AgentId,
  MessageType,
  createPaymentAckMessage,
} from "../a2a-protocol.js";

export class PaymentAgent extends BaseAgent {
  constructor(config) {
    super({
      ...config,
      agentId: AgentId.PAYMENT,
    });

    // Track processed payments to prevent duplicates
    this.processedPayments = new Set(); // correlationIds that have been paid
    this.paymentHistory = []; // Full payment history
  }

  /**
   * Handle PAYMENT_REQ from buyer
   */
  async handlePaymentReq(message, metadata) {
    console.log(`[${this.agentId}] Received PAYMENT_REQ`);

    const { correlationId, payload, from } = message;
    const { amount, tokenId, toAccount, memo, item, qty } = payload;

    this.addMessageToConversation(correlationId, message);

    console.log(`[${this.agentId}] Payment request:`);
    console.log(`[${this.agentId}]   Amount: ${amount}`);
    console.log(`[${this.agentId}]   Token: ${tokenId}`);
    console.log(`[${this.agentId}]   To: ${toAccount}`);
    console.log(`[${this.agentId}]   Memo: ${memo}`);

    // Check for duplicate payment (idempotency)
    if (this.processedPayments.has(correlationId)) {
      console.warn(
        `[${this.agentId}] Payment already processed for correlation ${correlationId}`
      );

      // Find the original transaction
      const originalPayment = this.paymentHistory.find(
        (p) => p.correlationId === correlationId
      );

      if (originalPayment) {
        // Re-send the acknowledgment
        await this._sendPaymentAck(
          from,
          originalPayment.transactionId,
          "success",
          amount,
          tokenId,
          null,
          correlationId
        );
      }

      return;
    }

    // Execute payment
    try {
      const result = await this._executePayment(
        amount,
        tokenId,
        toAccount,
        memo
      );

      if (result.success) {
        // Mark as processed
        this.processedPayments.add(correlationId);

        // Record in history
        this.paymentHistory.push({
          correlationId,
          transactionId: result.transactionId,
          amount,
          tokenId,
          toAccount,
          memo,
          timestamp: new Date().toISOString(),
          item,
          qty,
        });

        // Update conversation
        this.updateConversation(correlationId, {
          state: "paid",
          transactionId: result.transactionId,
        });

        console.log(`[${this.agentId}] ✅ Payment successful!`);
        console.log(
          `[${this.agentId}]   Transaction ID: ${result.transactionId}`
        );

        // Send acknowledgment
        await this._sendPaymentAck(
          from,
          result.transactionId,
          "success",
          amount,
          tokenId,
          null,
          correlationId
        );

        this.emit("paymentExecuted", {
          correlationId,
          transactionId: result.transactionId,
          amount,
          tokenId,
        });
      } else {
        console.error(`[${this.agentId}] ❌ Payment failed:`, result.error);

        // Send failure acknowledgment
        await this._sendPaymentAck(
          from,
          "N/A",
          "failed",
          amount,
          tokenId,
          result.error,
          correlationId
        );

        this.emit("paymentFailed", {
          correlationId,
          error: result.error,
        });
      }
    } catch (error) {
      console.error(`[${this.agentId}] Payment execution error:`, error);

      // Send error acknowledgment
      await this._sendPaymentAck(
        from,
        "N/A",
        "failed",
        amount,
        tokenId,
        error.message,
        correlationId
      );
    }
  }

  /**
   * Execute HTS token transfer
   *
   * @private
   */
  async _executePayment(amount, tokenId, toAccount, memo) {
    try {
      console.log(`[${this.agentId}] Executing transfer...`);

      // Determine if it's HBAR or token transfer
      const isHbar = tokenId === "HBAR" || tokenId === "0.0.0";

      let transaction;

      if (isHbar) {
        // HBAR transfer
        transaction = new TransferTransaction()
          .addHbarTransfer(this.accountId, new Hbar(-amount))
          .addHbarTransfer(AccountId.fromString(toAccount), new Hbar(amount))
          .setTransactionMemo(memo);
      } else {
        // Token transfer
        const token = TokenId.fromString(tokenId);

        transaction = new TransferTransaction()
          .addTokenTransfer(token, this.accountId, -amount)
          .addTokenTransfer(token, AccountId.fromString(toAccount), amount)
          .setTransactionMemo(memo);
      }

      // Execute transaction
      const txResponse = await transaction.execute(this.client);

      // Get receipt
      const receipt = await txResponse.getReceipt(this.client);

      if (receipt.status.toString() !== "SUCCESS") {
        return {
          success: false,
          error: `Transaction failed with status: ${receipt.status.toString()}`,
        };
      }

      return {
        success: true,
        transactionId: txResponse.transactionId.toString(),
      };
    } catch (error) {
      console.error(`[${this.agentId}] Transfer failed:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send payment acknowledgment
   *
   * @private
   */
  async _sendPaymentAck(
    to,
    transactionId,
    status,
    amount,
    tokenId,
    error,
    correlationId
  ) {
    console.log(`[${this.agentId}] Sending PAYMENT_ACK (status: ${status})`);

    const message = createPaymentAckMessage(
      this.agentId,
      to,
      transactionId,
      status,
      amount,
      tokenId,
      error,
      correlationId
    );

    const result = await this.sendMessage(message);

    if (result.success) {
      console.log(`[${this.agentId}] PAYMENT_ACK sent`);
    } else {
      console.error(
        `[${this.agentId}] Failed to send PAYMENT_ACK:`,
        result.error
      );
    }
  }

  /**
   * Check if payment was already processed
   */
  wasPaymentProcessed(correlationId) {
    return this.processedPayments.has(correlationId);
  }

  /**
   * Get payment history
   */
  getPaymentHistory() {
    return [...this.paymentHistory];
  }

  /**
   * Get payment by correlation ID
   */
  getPaymentByCorrelation(correlationId) {
    return this.paymentHistory.find((p) => p.correlationId === correlationId);
  }

  /**
   * Clear processed payments set (for testing)
   */
  clearProcessedPayments() {
    this.processedPayments.clear();
    console.log(`[${this.agentId}] Cleared processed payments cache`);
  }
}

export default PaymentAgent;
