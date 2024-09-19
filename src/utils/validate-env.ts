import process from 'node:process'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'fatal', 'silent', 'trace']).default('info'),
  SERVER_PORT: z.coerce.number().default(8000),
  SERVER_HOST: z.string().default('localhost'),
  DEBUG: z.string().transform((val) => {
    return val === 'true'
  }),
})

type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  process.loadEnvFile()
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(result.error.format(), null, 4))
    process.exit(1)
  }
  return result.data
}

export const env = validateEnv()
