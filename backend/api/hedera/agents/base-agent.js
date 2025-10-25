/**
 * Base Agent Class
 *
 * Foundation for all Hedera agents with HCS communication
 * and message routing capabilities.
 */

import { Client, PrivateKey } from "@hashgraph/sdk";
import { HCSTransport } from "../hcs-transport.js";
import {
  AgentId,
  MessageType,
  validateMessage,
  createErrorMessage,
} from "../a2a-protocol.js";
import EventEmitter from "events";

/**
 * Base class for Hedera agents
 */
export class BaseAgent extends EventEmitter {
  constructor(config) {
    super();

    this.agentId = config.agentId;
    this.accountId = config.accountId;
    this.privateKey = config.privateKey;
    this.topicId = config.topicId;
    this.mirrorNodeUrl = config.mirrorNodeUrl;

    this.client = null;
    this.transport = null;
    this.isRunning = false;

    // Track active conversations
    this.conversations = new Map(); // correlationId -> conversation state

    console.log(`[${this.agentId}] Agent initialized`);
  }

  /**
   * Start the agent
   */
  async start() {
    if (this.isRunning) {
      console.warn(`[${this.agentId}] Agent already running`);
      return;
    }

    try {
      // Initialize Hedera client
      this.client = Client.forTestnet().setOperator(
        this.accountId,
        PrivateKey.fromStringECDSA(this.privateKey)
      );

      console.log(`[${this.agentId}] Hedera client initialized`);
      console.log(`[${this.agentId}] Account: ${this.accountId}`);

      // Initialize HCS transport
      this.transport = new HCSTransport(
        this.client,
        this.topicId,
        this.mirrorNodeUrl
      );

      // Subscribe to messages
      await this.transport.subscribeToTopic(
        (message, metadata) => this._routeMessage(message, metadata),
        {
          filterAgentIds: [this.agentId], // Only receive messages for this agent
        }
      );

      this.isRunning = true;
      console.log(`[${this.agentId}] Agent started and listening for messages`);

      // Emit started event
      this.emit("started");
    } catch (error) {
      console.error(`[${this.agentId}] Failed to start agent:`, error);
      throw error;
    }
  }

  /**
   * Stop the agent
   */
  async stop() {
    if (!this.isRunning) {
      return;
    }

    console.log(`[${this.agentId}] Stopping agent...`);

    if (this.transport) {
      this.transport.unsubscribe();
    }

    if (this.client) {
      this.client.close();
    }

    this.isRunning = false;
    this.emit("stopped");

    console.log(`[${this.agentId}] Agent stopped`);
  }

  /**
   * Route incoming message to appropriate handler
   *
   * @private
   */
  async _routeMessage(message, metadata) {
    try {
      console.log(`[${this.agentId}] Routing message: ${message.type}`);

      // Validate message
      const validation = validateMessage(message);
      if (!validation.valid) {
        console.error(`[${this.agentId}] Invalid message:`, validation.errors);
        return;
      }

      // Emit raw message event
      this.emit("message", message, metadata);

      // Route to type-specific handler
      switch (message.type) {
        case MessageType.OFFER:
          await this.handleOffer(message, metadata);
          break;
        case MessageType.COUNTER:
          await this.handleCounter(message, metadata);
          break;
        case MessageType.ACCEPT:
          await this.handleAccept(message, metadata);
          break;
        case MessageType.DECLINE:
          await this.handleDecline(message, metadata);
          break;
        case MessageType.PAYMENT_REQ:
          await this.handlePaymentReq(message, metadata);
          break;
        case MessageType.PAYMENT_ACK:
          await this.handlePaymentAck(message, metadata);
          break;
        case MessageType.ERROR:
          await this.handleError(message, metadata);
          break;
        default:
          console.warn(
            `[${this.agentId}] Unknown message type: ${message.type}`
          );
      }
    } catch (error) {
      console.error(`[${this.agentId}] Error routing message:`, error);

      // Send error response
      await this.sendErrorMessage(
        message.from,
        "ROUTING_ERROR",
        `Failed to process message: ${error.message}`,
        message.id,
        message.correlationId
      );
    }
  }

  /**
   * Send a message via HCS
   *
   * @param {Object} message - A2A message
   * @returns {Promise<Object>} Publish result
   */
  async sendMessage(message) {
    if (!this.isRunning) {
      throw new Error("Agent is not running");
    }

    // Sign the message before sending
    // For demo purposes, we'll use a simple hash-based signature
    // In production, you'd use proper Ed25519 signing with Hedera keys
    const messageToSign = {
      ...message,
      signature: undefined, // Remove signature field before signing
    };

    const crypto = await import("crypto");
    const messageString = JSON.stringify(messageToSign);
    const signature = crypto
      .createHash("sha256")
      .update(messageString + this.privateKey)
      .digest("hex");

    message.signature = signature;

    const result = await this.transport.publishMessage(message);

    if (result.success) {
      this.emit("messageSent", message);
    } else {
      this.emit("messageError", message, result.error);
    }

    return result;
  }

  /**
   * Send error message
   */
  async sendErrorMessage(
    to,
    code,
    errorMessage,
    originalMessageId,
    correlationId
  ) {
    const message = createErrorMessage(
      this.agentId,
      to,
      code,
      errorMessage,
      originalMessageId,
      correlationId
    );

    return await this.sendMessage(message);
  }

  /**
   * Get or create conversation state
   */
  getConversation(correlationId) {
    if (!this.conversations.has(correlationId)) {
      this.conversations.set(correlationId, {
        correlationId,
        messages: [],
        state: "initiated",
        createdAt: new Date().toISOString(),
      });
    }
    return this.conversations.get(correlationId);
  }

  /**
   * Update conversation state
   */
  updateConversation(correlationId, updates) {
    const conversation = this.getConversation(correlationId);
    Object.assign(conversation, updates);
    this.conversations.set(correlationId, conversation);
  }

  /**
   * Add message to conversation history
   */
  addMessageToConversation(correlationId, message) {
    const conversation = this.getConversation(correlationId);
    conversation.messages.push({
      ...message,
      receivedAt: new Date().toISOString(),
    });
    this.conversations.set(correlationId, conversation);
  }

  // Message handlers to be implemented by subclasses

  async handleOffer(message, metadata) {
    console.log(`[${this.agentId}] Received OFFER (not implemented)`);
  }

  async handleCounter(message, metadata) {
    console.log(`[${this.agentId}] Received COUNTER (not implemented)`);
  }

  async handleAccept(message, metadata) {
    console.log(`[${this.agentId}] Received ACCEPT (not implemented)`);
  }

  async handleDecline(message, metadata) {
    console.log(`[${this.agentId}] Received DECLINE (not implemented)`);
  }

  async handlePaymentReq(message, metadata) {
    console.log(`[${this.agentId}] Received PAYMENT_REQ (not implemented)`);
  }

  async handlePaymentAck(message, metadata) {
    console.log(`[${this.agentId}] Received PAYMENT_ACK (not implemented)`);
  }

  async handleError(message, metadata) {
    console.log(`[${this.agentId}] Received ERROR:`, message.payload.message);
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      agentId: this.agentId,
      accountId: this.accountId,
      isRunning: this.isRunning,
      activeConversations: this.conversations.size,
      lastSequence: this.transport?.getLastSequenceNumber() || 0,
    };
  }
}

export default BaseAgent;
