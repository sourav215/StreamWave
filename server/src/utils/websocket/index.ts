import redis from "@/libs/redis";
import { kafka } from "@/utils/kafka";
import { WebSocket, WebSocketServer } from "ws";
import { Server as HttpServer } from "http";
import { logger } from "@/config/logger";

const producer = kafka.producer();

const connectedUsers: Map<string, WebSocket> = new Map();
const unseenCounts: Map<string, number> = new Map();

type IncomingMessage = {
  conversationId: string;
  fromUserId: string;
  toUserId: string;
  messageBody: string;
  type?: string;
};

export const createWebSocketServer = async (server: HttpServer) => {
  const wss = new WebSocketServer({ server });
  await producer.connect();

  logger.info("✅ WebSocket 🔌 server created and Kafka producer connected.");

  wss.on("connection", (ws: WebSocket) => {
    logger.info("New WebSocket connection established.");

    let registeredUserId: string | null = null;

    ws.on("message", async (rawMessage) => {
      try {
        const messageStr = rawMessage.toString();

        //Case 1: Register user on first plain message (non JSON)
        if (!registeredUserId && !messageStr.startsWith("{")) {
          registeredUserId = messageStr;

          // Store User and WebSocket in map
          connectedUsers.set(registeredUserId, ws);
          logger.info(
            `User ${registeredUserId} registered for WebSocket communication.`
          );

          const redisKey = `online:user:${registeredUserId}`;
          await redis.set(redisKey, "1");
          await redis.expire(redisKey, 60 * 5); // 5 minutes expiry
          return;
        }

        //Case 2: Handle incoming JSON messages
        const data: IncomingMessage = JSON.parse(messageStr);

        // Case 2.1: Data type = "MARK_AS_SEEN"
        if (data.type === "MARK_AS_SEEN") {
          const seenKey = `${registeredUserId}_${data.conversationId}`;
          unseenCounts.set(seenKey, 0);
          return;
        }

        //Case 2.2: Regular message handling
        const { fromUserId, toUserId, messageBody, conversationId } = data;
        if (!fromUserId || !toUserId || !messageBody || !conversationId) {
          logger.warn("Invalid message format received via WebSocket.");
          return;
        }

        // Produce message to Kafka
        const now = new Date().toISOString();
        const messagePayload = {
          conversationId,
          senderId: fromUserId,
          content: messageBody,
          createdAt: now,
        };

        const messageEvent = JSON.stringify({
          type: "NEW_MESSAGE",
          payload: messagePayload,
        });

        const receiverKey = `user_${toUserId}`;
        const senderKey = `user_${fromUserId}`;

        // Update unseen count dynamically
        const unseenKey = `${receiverKey}_${conversationId}`;
        const prevCount = unseenCounts.get(unseenKey) || 0;
        unseenCounts.set(unseenKey, prevCount + 1);

        // Send message to receiver
        const receiverSocket = connectedUsers.get(receiverKey);
        if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
          // User is online, send message directly
          receiverSocket.send(messageEvent);
          logger.info(`Message sent to user ${receiverKey}.`);

          // Also notify unseen count
          receiverSocket.send(
            JSON.stringify({
              type: "UNSEEN_COUNT_UPDATE",
              payload: {
                conversationId,
                count: prevCount + 1,
              },
            })
          );
          logger.info(`Unseen count update sent to user ${receiverKey}.`);
        } else {
          // User is offline, log the event
          logger.info(`User ${receiverKey} is offline. Message queued.`);
        }

        // Echo back to sender for confirmation
        const senderSocket = connectedUsers.get(senderKey);
        if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
          senderSocket.send(messageEvent);
          logger.info(`Echoed message to sender ${senderKey}.`);
        }

        // Push to Kafka consumer
        await producer.send({
          topic: "chat-events",
          messages: [
            {
              key: conversationId,
              value: JSON.stringify(messagePayload),
            },
          ],
        });
        logger.info(
          `Message queued to Kafka for conversation ${conversationId}.`
        );
      } catch (error) {
        logger.error(error, "Error processing WebSocket message.");
      }
    });

    ws.on("close", async () => {
      if (registeredUserId) {
        connectedUsers.delete(registeredUserId);
        const redisKey = `online:user:${registeredUserId}`;
        await redis.del(redisKey);
        logger.info(
          `WebSocket connection closed. User ${registeredUserId} deregistered.`
        );
      }
    });

    ws.on("error", (error) => {
      logger.error(error, "WebSocket error occurred.");
    });
  });

  logger.info("WebSocket server is ready.");
};
