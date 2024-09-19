import { env } from '#root/utils/validate-env.js'

export const config = {
  port: env.SERVER_PORT,
  host: env.SERVER_HOST,
  logLevel: env.LOG_LEVEL,
  isDebug: env.DEBUG,
}
