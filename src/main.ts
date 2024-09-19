import process from 'node:process'
import { createServer, createServerManager } from '#root/server/index.js'
import { logger } from '#root/lib/logger.js'

async function startServer() {
  const server = createServer({
    logger,
  })
  const serverManager = createServerManager(server)

  // graceful shutdown
  onShutdown(async () => {
    logger.info('Shutdown')
    await serverManager.stop()
  })

  // start server
  const info = await serverManager.start()
  logger.info({
    msg: 'Server started',
    url: info.url,
  })
}

try {
  await startServer()
}
catch (error) {
  logger.error(error)
  process.exit(1)
}

// Utils
function onShutdown(cleanUp: () => Promise<void>) {
  let isShuttingDown = false
  const handleShutdown = async () => {
    if (isShuttingDown)
      return
    isShuttingDown = true
    await cleanUp()
  }
  process.on('SIGINT', handleShutdown)
  process.on('SIGTERM', handleShutdown)
}
