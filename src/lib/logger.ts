import { pino } from 'pino'
import { config } from '#root/config.js'

const fileTransport: pino.TransportTargetOptions = {
  level: config.logLevel,
  target: 'pino/file',
  options: { destination: './app.log' },
}

const consoleTransport: pino.TransportTargetOptions = {
  level: config.logLevel,
  target: 'pino-pretty',
  options: {
    colorize: true,
    ignore: 'pid,hostname',
    translateTime: true,
  },
}

export const logger = pino({
  level: config.logLevel,
  transport: config.isDebug ? consoleTransport : fileTransport,
})

export type Logger = typeof logger
