import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { getPath } from 'hono/utils/url'
import { serve } from '@hono/node-server'
import { requestLogger } from '#root/server/middlewares/request-logger.js'
import { setLogger } from '#root/server/middlewares/logger.js'
import { requestId } from '#root/server/middlewares/request-id.js'
import { config } from '#root/config.js'
import type { Env } from '#root/server/environment.js'
import type { Logger } from '#root/lib/logger.js'

export function createServer({
  logger,
}: {
  logger: Logger
}) {
  const server = new Hono<Env>()

  server.use(requestId())
  server.use(setLogger(logger))
  if (config.isDebug)
    server.use(requestLogger())

  server.onError(async (error, c) => {
    if (error instanceof HTTPException) {
      if (error.status < 500)
        c.var.logger.info(error)
      else
        c.var.logger.error(error)

      return error.getResponse()
    }

    // unexpected error
    c.var.logger.error({
      err: error,
      method: c.req.raw.method,
      path: getPath(c.req.raw),
    })
    return c.json(
      {
        error: 'Oops! Something went wrong.',
      },
      500,
    )
  })

  server.get('/', c => c.json({ status: true }))

  return server
}

export type Server = Awaited<ReturnType<typeof createServer>>

export function createServerManager(server: Server) {
  let handle: undefined | ReturnType<typeof serve>
  return {
    start() {
      return new Promise<{ url: string } >((resolve) => {
        handle = serve(
          {
            fetch: server.fetch,
            hostname: config.host,
            port: config.port,
          },
          info => resolve({
            url: info.family === 'IPv6'
              ? `http://[${info.address}]:${info.port}`
              : `http://${info.address}:${info.port}`,
          }),
        )
      })
    },
    stop() {
      return new Promise<void>((resolve) => {
        if (handle)
          handle.close(() => resolve())
        else
          resolve()
      })
    },
  }
}
