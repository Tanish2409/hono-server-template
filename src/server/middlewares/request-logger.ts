import type { MiddlewareHandler } from 'hono'
import { getPath } from 'hono/utils/url'
import type { Env } from '#root/server/environment.js'

export function requestLogger(): MiddlewareHandler<Env> {
  return async (c, next) => {
    const { method } = c.req
    const path = getPath(c.req.raw)

    c.var.logger.debug({
      msg: 'Incoming request',
      method,
      path,
    })
    const startTime = performance.now()

    await next()

    const endTime = performance.now()
    c.var.logger.debug({
      msg: 'Request completed',
      method,
      path,
      status: c.res.status,
      elapsed: endTime - startTime,
    })
  }
}
