/**
 * HCS Transport Layer
 *
 * Provides publish/subscribe functionality for A2A messages
 * using Hedera Consensus Service (HCS) as the message bus.
 */

import {
  TopicMessageSubmitTransaction,
  TopicMessageQuery,
  Status,
} from "@hashgraph/sdk";
import { validateMessage } from "./a2a-protocol.js";

/**
 * HCS Transport for A2A messages
 */
export class HCSTransport {
  constructor(client, topicId, mirrorNodeUrl) {
    this.client = client;
    this.topicId = topicId;
    this.mirrorNodeUrl =
      mirrorNodeUrl || "https://testnet.mirrornode.hedera.com";
    this.lastSequenceNumber = 0;
    this.messageHandlers = [];
    this.isSubscribed = false;
  }

  /**
   * Publish a message to the HCS topic
   *
   * @param {Object} message - A2A message to publish
   * @returns {Promise<{success: boolean, transactionId?: string, error?: string}>}
   */
  async publishMessage(message) {
    try {
      // Validate message structure
      const validation = validateMessage(message);
      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid message: ${validation.errors.join(", ")}`,
        };
      }

      // Serialize message to JSON
      const messageJson = JSON.stringify(message);
      const messageBytes = Buffer.from(messageJson, "utf-8");

      // Submit to HCS topic
      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId)
        .setMessage(messageBytes);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      if (receipt.status !== Status.Success) {
        return {
          success: false,
          error: `Transaction failed with status: ${receipt.status.toString()}`,
        };
      }

      console.log(`[HCS] Message published: ${message.type} (${message.id})`);
      console.log(
        `[HCS] Transaction ID: ${txResponse.transactionId.toString()}`
      );

      return {
        success: true,
        transactionId: txResponse.transactionId.toString(),
        sequenceNumber: receipt.topicSequenceNumber?.toNumber(),
      };
    } catch (error) {
      console.error("[HCS] Failed to publish message:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Subscribe to messages from the HCS topic
   *
   * @param {Function} callback - Called for each message: (message, metadata) => void
   * @param {Object} options - Subscription options
   * @param {string[]} options.filterAgentIds - Only receive messages for these agent IDs
   * @param {number} options.startSequence - Start from specific sequence number
   */
  async subscribeToTopic(callback, options = {}) {
    if (this.isSubscribed) {
      console.warn("[HCS] Already subscribed to topic");
      return;
    }

    const { filterAgentIds = [], startSequence } = options;

    console.log(`[HCS] Subscribing to topic ${this.topicId}...`);
    if (filterAgentIds.length > 0) {
      console.log(
        `[HCS] Filtering for agent IDs: ${filterAgentIds.join(", ")}`
      );
    }

    try {
      // Create subscription query
      const query = new TopicMessageQuery().setTopicId(this.topicId);

      // Set start time or sequence
      if (startSequence !== undefined) {
        // Note: Hedera SDK doesn't directly support starting from sequence number
        // We'll filter in the callback instead
        this.lastSequenceNumber = startSequence - 1;
      } else {
        // Start from now (don't retrieve historical messages)
        // Don't set start time to get only future messages
      }

      // Subscribe with callback
      // Track processed messages to avoid duplicates
      const processedMessages = new Set();

      const messageHandler = (message) => {
        // Check if this is actually a message object (not an error)
        if (message && message.contents && message.consensusTimestamp) {
          // Create unique key for this message
          const messageKey = `${message.consensusTimestamp.seconds.toString()}-${message.consensusTimestamp.nanos.toString()}-${message.sequenceNumber.toString()}`;

          // Skip if already processed
          if (processedMessages.has(messageKey)) {
            return;
          }
          processedMessages.add(messageKey);

          // Clean up old entries (keep last 100)
          if (processedMessages.size > 100) {
            const firstKey = processedMessages.values().next().value;
            processedMessages.delete(firstKey);
          }

          this._handleIncomingMessage(
            message,
            callback,
            filterAgentIds,
            startSequence
          );
        }
      };

      const errorHandler = (error) => {
        // Sometimes valid messages come through error callback - check first
        if (error && error.contents && error.consensusTimestamp) {
          messageHandler(error);
        } else {
          console.error("[HCS] Subscription error:", error);
        }
      };

      query.subscribe(this.client, messageHandler, errorHandler);

      this.isSubscribed = true;
      console.log("[HCS] Subscription active");
    } catch (error) {
      console.error("[HCS] Failed to subscribe:", error);
      throw error;
    }
  }

  /**
   * Handle incoming HCS message
   *
   * @private
   */
  _handleIncomingMessage(hcsMessage, callback, filterAgentIds, startSequence) {
    try {
      // Parse message content
      const messageBytes = hcsMessage.contents;
      const messageJson = messageBytes.toString("utf-8");
      const message = JSON.parse(messageJson);

      // Track sequence number
      const sequenceNumber = hcsMessage.sequenceNumber.toNumber();

      // Skip if we've already processed this sequence
      if (startSequence !== undefined && sequenceNumber < startSequence) {
        return;
      }

      this.lastSequenceNumber = sequenceNumber;

      // Validate message structure
      const validation = validateMessage(message);
      if (!validation.valid) {
        console.warn("[HCS] Received invalid message:", validation.errors);
        return;
      }

      // Filter by agent ID
      if (filterAgentIds.length > 0) {
        const isForMe =
          message.to === "broadcast" || filterAgentIds.includes(message.to);

        if (!isForMe) {
          // Message not for this agent, skip
          return;
        }
      }

      // Extract metadata
      const metadata = {
        sequenceNumber,
        consensusTimestamp: hcsMessage.consensusTimestamp
          .toDate()
          .toISOString(),
        runningHash: hcsMessage.runningHash.toString("hex"),
        chunks: hcsMessage.chunks || 1,
      };

      console.log(
        `[HCS] Received message: ${message.type} (seq: ${sequenceNumber})`
      );
      console.log(`[HCS] From: ${message.from} → To: ${message.to}`);

      // Call the user's callback
      callback(message, metadata);
    } catch (error) {
      console.error("[HCS] Error processing message:", error);
    }
  }

  /**
   * Get messages from mirror node (for historical queries)
   *
   * @param {Object} options
   * @param {number} options.limit - Max number of messages
   * @param {number} options.sequence - Start sequence number
   * @returns {Promise<Array>} Array of messages
   */
  async getHistoricalMessages(options = {}) {
    const { limit = 100, sequence } = options;

    try {
      let url = `${this.mirrorNodeUrl}/api/v1/topics/${this.topicId}/messages`;
      const params = [];

      if (limit) params.push(`limit=${limit}`);
      if (sequence) params.push(`sequencenumber=gte:${sequence}`);

      if (params.length > 0) {
        url += "?" + params.join("&");
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Mirror node request failed: ${response.status}`);
      }

      const data = await response.json();

      // Parse messages
      const messages = data.messages.map((msg) => {
        const messageBytes = Buffer.from(msg.message, "base64");
        const messageJson = messageBytes.toString("utf-8");
        const message = JSON.parse(messageJson);

        return {
          message,
          metadata: {
            sequenceNumber: msg.sequence_number,
            consensusTimestamp: msg.consensus_timestamp,
            runningHash: msg.running_hash,
          },
        };
      });

      return messages;
    } catch (error) {
      console.error("[HCS] Failed to fetch historical messages:", error);
      return [];
    }
  }

  /**
   * Get last processed sequence number
   * (useful for resuming subscriptions)
   */
  getLastSequenceNumber() {
    return this.lastSequenceNumber;
  }

  /**
   * Set last processed sequence number
   * (useful for restoring state after restart)
   */
  setLastSequenceNumber(sequence) {
    this.lastSequenceNumber = sequence;
  }

  /**
   * Unsubscribe from topic
   */
  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.isSubscribed = false;
      console.log("[HCS] Unsubscribed from topic");
    }
  }
}

/**
 * Create HCS transport instance
 *
 * @param {Client} client - Hedera client
 * @param {string} topicId - HCS topic ID
 * @param {string} mirrorNodeUrl - Mirror node URL
 * @returns {HCSTransport}
 */
export function createHCSTransport(client, topicId, mirrorNodeUrl) {
  return new HCSTransport(client, topicId, mirrorNodeUrl);
}

export default HCSTransport;
