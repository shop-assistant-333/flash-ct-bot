/**
 * Single place where `import.meta.env` is read. Everything else imports `env`
 * so a missing variable fails once, at startup, instead of at a random call site.
 */

function required(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name]

  if (!value) {
    throw new Error(`Missing environment variable: ${name}. See .env.example.`)
  }

  return value
}

export const env = {
  apiBaseUrl: required('VITE_API_BASE_URL'),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const
