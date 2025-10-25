/**
 * Buyer Agent
 *
 * Initiates negotiations with sellers and handles counteroffers.
 */

import { BaseAgent } from "./base-agent.js";
import {
  AgentId,
  MessageType,
  createOfferMessage,
  createCounterMessage,
  createAcceptMessage,
  createDeclineMessage,
  createPaymentReqMessage,
} from "../a2a-protocol.js";

export class BuyerAgent extends BaseAgent {
  constructor(config) {
    super({
      ...config,
      agentId: AgentId.BUYER,
    });

    // Buyer-specific config
    this.maxPrice = config.maxPrice || 100; // Maximum price willing to pay
    this.autoAcceptThreshold = config.autoAcceptThreshold || 0.9; // Auto-accept if within 90% of max
    this.paymentTokenId = config.paymentTokenId;
    this.sellerAccountId = config.sellerAccountId; // For payment
  }

  /**
   * Initiate a purchase offer
   *
   * @param {Object} params
   * @param {string} params.item - Item to purchase
   * @param {number} params.qty - Quantity
   * @param {number} params.unitPrice - Offered price per unit
   * @param {string} params.currency - Currency (e.g., "HBAR")
   */
  async makeOffer({ item, qty, unitPrice, currency }) {
    console.log(
      `[${this.agentId}] Making offer for ${qty} ${item} at ${unitPrice} ${currency} each`
    );

    // Create OFFER message
    const message = createOfferMessage(
      this.agentId,
      AgentId.SELLER,
      item,
      qty,
      unitPrice,
      currency
    );

    // Initialize conversation state
    this.updateConversation(message.correlationId, {
      state: "offer_sent",
      item,
      qty,
      initialOffer: unitPrice,
      maxPrice: this.maxPrice,
    });

    // Send message
    const result = await this.sendMessage(message);

    if (result.success) {
      console.log(
        `[${this.agentId}] Offer sent (correlation: ${message.correlationId})`
      );
      this.emit("offerSent", { message, result });
    } else {
      console.error(`[${this.agentId}] Failed to send offer:`, result.error);
      this.emit("offerFailed", { message, error: result.error });
    }

    return { success: result.success, correlationId: message.correlationId };
  }

  /**
   * Handle COUNTER from seller
   */
  async handleCounter(message, metadata) {
    console.log(`[${this.agentId}] Received COUNTER from seller`);

    const { correlationId, payload, from } = message;
    const { item, qty, unitPrice, currency, reason } = payload;

    // Update conversation
    this.addMessageToConversation(correlationId, message);
    const conversation = this.getConversation(correlationId);

    console.log(
      `[${this.agentId}] Seller counter: ${qty} ${item} at ${unitPrice} ${currency}`
    );
    if (reason) {
      console.log(`[${this.agentId}] Reason: ${reason}`);
    }

    // Decide whether to accept or counter
    const shouldAccept = this._evaluateCounteroffer(unitPrice, conversation);

    if (shouldAccept) {
      // Accept the counteroffer
      await this._acceptOffer(correlationId, item, qty, unitPrice, currency);
    } else if (unitPrice > this.maxPrice) {
      // Price too high, decline
      await this._declineOffer(
        correlationId,
        from,
        `Price ${unitPrice} exceeds max budget of ${this.maxPrice}`
      );
    } else {
      // Counter with a higher offer (meet in the middle)
      const newOffer = Math.min(
        (unitPrice + conversation.initialOffer) / 2,
        this.maxPrice
      );
      await this._sendCounteroffer(
        correlationId,
        from,
        item,
        qty,
        newOffer,
        currency
      );
    }
  }

  /**
   * Handle ACCEPT from seller
   */
  async handleAccept(message, metadata) {
    console.log(`[${this.agentId}] Received ACCEPT from seller`);

    const { correlationId, payload } = message;
    const { item, qty, unitPrice, currency, totalAmount } = payload;

    this.addMessageToConversation(correlationId, message);
    this.updateConversation(correlationId, {
      state: "accepted",
      finalPrice: unitPrice,
      totalAmount,
    });

    console.log(
      `[${this.agentId}] Deal accepted: ${qty} ${item} for ${totalAmount} ${currency}`
    );
    this.emit("dealAccepted", {
      correlationId,
      item,
      qty,
      unitPrice,
      totalAmount,
    });

    // Initiate payment
    await this._initiatePayment(correlationId, totalAmount, item, qty);
  }

  /**
   * Handle DECLINE from seller
   */
  async handleDecline(message, metadata) {
    console.log(`[${this.agentId}] Received DECLINE from seller`);

    const { correlationId, payload } = message;
    const { reason } = payload;

    this.addMessageToConversation(correlationId, message);
    this.updateConversation(correlationId, {
      state: "declined_by_seller",
    });

    console.log(`[${this.agentId}] Seller declined: ${reason}`);
    this.emit("dealDeclined", { correlationId, reason });
  }

  /**
   * Handle PAYMENT_ACK from payment agent
   */
  async handlePaymentAck(message, metadata) {
    console.log(`[${this.agentId}] Received PAYMENT_ACK`);

    const { correlationId, payload } = message;
    const { transactionId, status, amount, error } = payload;

    this.addMessageToConversation(correlationId, message);

    if (status === "success") {
      this.updateConversation(correlationId, {
        state: "paid",
        transactionId,
      });

      console.log(`[${this.agentId}] Payment successful!`);
      console.log(`[${this.agentId}] Transaction ID: ${transactionId}`);
      console.log(`[${this.agentId}] Amount: ${amount}`);

      this.emit("paymentSuccess", { correlationId, transactionId, amount });
    } else {
      this.updateConversation(correlationId, {
        state: "payment_failed",
        paymentError: error,
      });

      console.error(`[${this.agentId}] Payment failed: ${error}`);
      this.emit("paymentFailed", { correlationId, error });
    }
  }

  /**
   * Evaluate whether to accept a counteroffer
   *
   * @private
   */
  _evaluateCounteroffer(counterPrice, conversation) {
    // Accept if within threshold
    if (counterPrice <= this.maxPrice * this.autoAcceptThreshold) {
      console.log(`[${this.agentId}] Auto-accepting (within threshold)`);
      return true;
    }

    // Accept if at or below max price and this is not the first counter
    if (counterPrice <= this.maxPrice && conversation.messages.length > 2) {
      console.log(
        `[${this.agentId}] Accepting (within budget after negotiation)`
      );
      return true;
    }

    return false;
  }

  /**
   * Accept an offer
   *
   * @private
   */
  async _acceptOffer(correlationId, item, qty, unitPrice, currency) {
    console.log(`[${this.agentId}] Accepting offer`);

    const message = createAcceptMessage(
      this.agentId,
      AgentId.SELLER,
      item,
      qty,
      unitPrice,
      currency,
      correlationId
    );

    this.updateConversation(correlationId, {
      state: "accepting",
    });

    const result = await this.sendMessage(message);

    if (result.success) {
      console.log(`[${this.agentId}] ACCEPT sent`);

      // Initiate payment after accepting
      const totalAmount = qty * unitPrice;
      await this._initiatePayment(correlationId, totalAmount, item, qty);
    } else {
      console.error(`[${this.agentId}] Failed to send ACCEPT:`, result.error);
    }
  }

  /**
   * Decline an offer
   *
   * @private
   */
  async _declineOffer(correlationId, to, reason) {
    console.log(`[${this.agentId}] Declining offer: ${reason}`);

    const message = createDeclineMessage(
      this.agentId,
      to,
      reason,
      correlationId
    );

    this.updateConversation(correlationId, {
      state: "declined_by_buyer",
    });

    const result = await this.sendMessage(message);

    if (result.success) {
      console.log(`[${this.agentId}] DECLINE sent`);
      this.emit("dealDeclined", { correlationId, reason });
    }
  }

  /**
   * Send counteroffer
   *
   * @private
   */
  async _sendCounteroffer(correlationId, to, item, qty, unitPrice, currency) {
    console.log(
      `[${this.agentId}] Sending counteroffer: ${unitPrice} ${currency}`
    );

    const message = createCounterMessage(
      this.agentId,
      to,
      item,
      qty,
      unitPrice,
      currency,
      `Counter offer at ${unitPrice}`,
      correlationId
    );

    this.updateConversation(correlationId, {
      state: "counter_sent",
    });

    const result = await this.sendMessage(message);

    if (result.success) {
      console.log(`[${this.agentId}] COUNTER sent`);
    }
  }

  /**
   * Initiate payment request
   *
   * @private
   */
  async _initiatePayment(correlationId, amount, item, qty) {
    console.log(`[${this.agentId}] Initiating payment: ${amount}`);

    const message = createPaymentReqMessage(
      this.agentId,
      AgentId.PAYMENT,
      amount,
      this.paymentTokenId,
      this.sellerAccountId,
      `Payment for ${qty} ${item}`,
      item,
      qty,
      correlationId
    );

    this.updateConversation(correlationId, {
      state: "payment_requested",
    });

    const result = await this.sendMessage(message);

    if (result.success) {
      console.log(`[${this.agentId}] PAYMENT_REQ sent to payment agent`);
      this.emit("paymentRequested", { correlationId, amount });
    } else {
      console.error(
        `[${this.agentId}] Failed to send PAYMENT_REQ:`,
        result.error
      );
    }
  }
}

export default BuyerAgent;
