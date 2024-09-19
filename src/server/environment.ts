import type { Logger } from '#root/lib/logger.js'

export interface Env {
  Variables: {
    requestId: string
    logger: Logger
  }
}
