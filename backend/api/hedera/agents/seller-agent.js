/**
 * Seller Agent
 *
 * Responds to buyer offers with counteroffers or acceptance.
 */

import { BaseAgent } from "./base-agent.js";
import {
  AgentId,
  MessageType,
  createCounterMessage,
  createAcceptMessage,
  createDeclineMessage,
} from "../a2a-protocol.js";

export class SellerAgent extends BaseAgent {
  constructor(config) {
    super({
      ...config,
      agentId: AgentId.SELLER,
    });

    // Seller-specific config
    this.minPrice = config.minPrice || 50; // Minimum acceptable price
    this.idealPrice = config.idealPrice || 80; // Ideal selling price
    this.autoAcceptThreshold = config.autoAcceptThreshold || 0.95; // Auto-accept if within 95% of ideal
    this.inventory = config.inventory || {}; // item -> quantity available
  }

  /**
   * Handle OFFER from buyer
   */
  async handleOffer(message, metadata) {
    console.log(`[${this.agentId}] Received OFFER from buyer`);

    const { correlationId, payload, from } = message;
    const { item, qty, unitPrice, currency } = payload;

    // Track conversation
    this.addMessageToConversation(correlationId, message);
    this.updateConversation(correlationId, {
      state: "offer_received",
      item,
      qty,
      buyerOffer: unitPrice,
      buyerId: from,
    });

    console.log(
      `[${this.agentId}] Buyer offers: ${qty} ${item} at ${unitPrice} ${currency}`
    );

    // Check inventory
    if (!this._hasInventory(item, qty)) {
      console.log(`[${this.agentId}] Insufficient inventory for ${item}`);
      await this._declineOffer(
        correlationId,
        from,
        `Insufficient inventory for ${qty} ${item}`
      );
      return;
    }

    // Evaluate offer
    const decision = this._evaluateOffer(unitPrice, item);

    if (decision.action === "accept") {
      await this._acceptOffer(
        correlationId,
        from,
        item,
        qty,
        unitPrice,
        currency
      );
    } else if (decision.action === "counter") {
      await this._sendCounteroffer(
        correlationId,
        from,
        item,
        qty,
        decision.counterPrice,
        currency,
        decision.reason
      );
    } else {
      await this._declineOffer(correlationId, from, decision.reason);
    }
  }

  /**
   * Handle COUNTER from buyer
   */
  async handleCounter(message, metadata) {
    console.log(`[${this.agentId}] Received COUNTER from buyer`);

    const { correlationId, payload, from } = message;
    const { item, qty, unitPrice, currency } = payload;

    this.addMessageToConversation(correlationId, message);
    const conversation = this.getConversation(correlationId);

    console.log(
      `[${this.agentId}] Buyer counter: ${qty} ${item} at ${unitPrice} ${currency}`
    );

    // Re-evaluate with updated price
    const decision = this._evaluateOffer(unitPrice, item, true);

    if (decision.action === "accept") {
      await this._acceptOffer(
        correlationId,
        from,
        item,
        qty,
        unitPrice,
        currency
      );
    } else if (
      decision.action === "counter" &&
      conversation.messages.length < 6
    ) {
      // Only counter up to 3 rounds of negotiation
      await this._sendCounteroffer(
        correlationId,
        from,
        item,
        qty,
        decision.counterPrice,
        currency,
        decision.reason
      );
    } else {
      // Either price too low or too many rounds
      await this._declineOffer(
        correlationId,
        from,
        conversation.messages.length >= 6
          ? "Unable to reach agreement after multiple rounds"
          : decision.reason
      );
    }
  }

  /**
   * Handle ACCEPT from buyer
   */
  async handleAccept(message, metadata) {
    console.log(`[${this.agentId}] Received ACCEPT from buyer`);

    const { correlationId, payload } = message;
    const { item, qty, unitPrice, totalAmount } = payload;

    this.addMessageToConversation(correlationId, message);
    this.updateConversation(correlationId, {
      state: "accepted_by_buyer",
      finalPrice: unitPrice,
      totalAmount,
    });

    console.log(
      `[${this.agentId}] Deal confirmed: ${qty} ${item} for ${totalAmount}`
    );

    // Reserve inventory
    this._reserveInventory(item, qty);

    this.emit("dealConfirmed", {
      correlationId,
      item,
      qty,
      unitPrice,
      totalAmount,
    });
  }

  /**
   * Handle DECLINE from buyer
   */
  async handleDecline(message, metadata) {
    console.log(`[${this.agentId}] Received DECLINE from buyer`);

    const { correlationId, payload } = message;
    const { reason } = payload;

    this.addMessageToConversation(correlationId, message);
    this.updateConversation(correlationId, {
      state: "declined_by_buyer",
    });

    console.log(`[${this.agentId}] Buyer declined: ${reason}`);
    this.emit("dealDeclined", { correlationId, reason });
  }

  /**
   * Evaluate buyer's offer
   *
   * @private
   * @returns {{ action: string, counterPrice?: number, reason?: string }}
   */
  _evaluateOffer(offeredPrice, item, isCounter = false) {
    console.log(
      `[${this.agentId}] Evaluating offer: ${offeredPrice} (min: ${this.minPrice}, ideal: ${this.idealPrice})`
    );

    // Auto-accept if close to ideal price
    if (offeredPrice >= this.idealPrice * this.autoAcceptThreshold) {
      console.log(`[${this.agentId}] Price acceptable (near ideal)`);
      return { action: "accept" };
    }

    // Accept if at or above minimum and this is a counter
    if (isCounter && offeredPrice >= this.minPrice) {
      console.log(`[${this.agentId}] Accepting counteroffer (above minimum)`);
      return { action: "accept" };
    }

    // Reject if below minimum
    if (offeredPrice < this.minPrice) {
      console.log(`[${this.agentId}] Price too low (below minimum)`);
      return {
        action: "decline",
        reason: `Price ${offeredPrice} is below minimum ${this.minPrice}`,
      };
    }

    // Counter with a price between offer and ideal
    const counterPrice = Math.max(
      this.minPrice,
      (offeredPrice + this.idealPrice) / 2
    );

    console.log(`[${this.agentId}] Sending counteroffer: ${counterPrice}`);

    return {
      action: "counter",
      counterPrice: Math.round(counterPrice * 100) / 100, // Round to 2 decimals
      reason: `Looking for ${this.idealPrice}, can offer ${counterPrice}`,
    };
  }

  /**
   * Check if item is in inventory
   *
   * @private
   */
  _hasInventory(item, qty) {
    const available = this.inventory[item] || 0;
    return available >= qty;
  }

  /**
   * Reserve inventory
   *
   * @private
   */
  _reserveInventory(item, qty) {
    if (this.inventory[item]) {
      this.inventory[item] -= qty;
      console.log(
        `[${this.agentId}] Reserved ${qty} ${item} (remaining: ${this.inventory[item]})`
      );
    }
  }

  /**
   * Accept an offer
   *
   * @private
   */
  async _acceptOffer(correlationId, to, item, qty, unitPrice, currency) {
    console.log(`[${this.agentId}] Accepting offer`);

    const message = createAcceptMessage(
      this.agentId,
      to,
      item,
      qty,
      unitPrice,
      currency,
      correlationId
    );

    this.updateConversation(correlationId, {
      state: "accepted_by_seller",
      finalPrice: unitPrice,
    });

    const result = await this.sendMessage(message);

    if (result.success) {
      console.log(`[${this.agentId}] ACCEPT sent`);
      this.emit("offerAccepted", { correlationId, item, qty, unitPrice });
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
      state: "declined_by_seller",
    });

    const result = await this.sendMessage(message);

    if (result.success) {
      console.log(`[${this.agentId}] DECLINE sent`);
      this.emit("offerDeclined", { correlationId, reason });
    }
  }

  /**
   * Send counteroffer
   *
   * @private
   */
  async _sendCounteroffer(
    correlationId,
    to,
    item,
    qty,
    unitPrice,
    currency,
    reason
  ) {
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
      reason,
      correlationId
    );

    this.updateConversation(correlationId, {
      state: "counter_sent",
      lastCounterPrice: unitPrice,
    });

    const result = await this.sendMessage(message);

    if (result.success) {
      console.log(`[${this.agentId}] COUNTER sent`);
      this.emit("counterSent", { correlationId, item, qty, unitPrice });
    } else {
      console.error(`[${this.agentId}] Failed to send COUNTER:`, result.error);
    }
  }

  /**
   * Update inventory levels
   */
  updateInventory(item, qty) {
    this.inventory[item] = qty;
    console.log(`[${this.agentId}] Inventory updated: ${item} = ${qty}`);
  }

  /**
   * Get current inventory
   */
  getInventory() {
    return { ...this.inventory };
  }
}

export default SellerAgent;
