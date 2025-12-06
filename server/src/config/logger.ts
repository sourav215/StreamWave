import pino from "pino";
import type { TransportTargetOptions } from "pino";

const target: TransportTargetOptions[] = [
  {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "yyyy-mm-dd HH:MM:ss.l 'IST'",
      ignore: "pid,hostname",
    },
  },
];

export const logger = pino({
  transport: {
    targets: target,
  },
});
