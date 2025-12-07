import redis from "@/libs/redis";

export const incrementUnseenCount = async (conversationId: string) => {
  const key = `unseen:user_${conversationId}`;
  await redis.incr(key);
};

export const getUnseenCount = async (conversationId: string) => {
  const key = `unseen:user_${conversationId}`;
  const count = await redis.get(key);
  return parseInt(count || "0");
}

export const clearUnseenCount = async (conversationId: string) => {
  const key = `unseen:user_${conversationId}`;
  await redis.del(key);
}
