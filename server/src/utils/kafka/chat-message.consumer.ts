import { prisma } from "@/libs/prisma";
import { kafka } from "@/utils/kafka";
import { Consumer, EachMessagePayload } from "kafkajs";
import { logger } from "@/config/logger";
import { incrementUnseenCount } from "@/libs/redis/message.redis";

interface BufferedMessage {
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

const TOPIC = "chat-events";
const GROUP_ID = "chat-message-consumer-group";
const BATCH_INTERVAL_MS = 3000; // 3 seconds

let buffer: BufferedMessage[] = [];
let flushTimer: NodeJS.Timeout | null = null;

// Initialize Kafka consumer
export async function startConsumer() {
  const consumer: Consumer = kafka.consumer({ groupId: GROUP_ID });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });

  logger.info(
    `✅ Kafka Consumer 🤳 connected and subscribed to topic: ${TOPIC}.`
  );

  // Start consuming messages
  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      if (!message.value) return;
      try {
        const parsed: BufferedMessage = JSON.parse(message.value.toString());
        buffer.push(parsed);

        // Start timer on first messsage
        if (buffer.length === 1 && !flushTimer) {
          flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS);
        }
      } catch (error) {
        logger.error(error, "Error parsing chat message from Kafka.");
      }
    },
  });
}

// Flush the buffer to the database
async function flushBufferToDb() {
  const toInsert = buffer.splice(0, buffer.length); // Clear the buffer
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (toInsert.length === 0) return;
  try {
    const prismaPayload = toInsert.map((msg) => {
      return {
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        content: msg.content,
        createdAt: new Date(msg.createdAt),
      };
    });

    await prisma.message.createMany({
      data: prismaPayload,
    });

    // Redis unseen counter (only if DB insert successful)
    for (const msg of prismaPayload) {
      await incrementUnseenCount(msg.conversationId);
    }
    logger.info(
      `Flushed ${prismaPayload.length} chat messages to the DB and Redis.`
    );
  } catch (error) {
    logger.error(error, "Error flushing chat messages to the database.");
    buffer.unshift(...toInsert); // Re-add messages to buffer on failure
    if (!flushTimer) {
      flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS);
    }
  }
}
