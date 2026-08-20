export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
  },
  ai: {
    apiKey: process.env.AI_API_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || '',
    model: process.env.AI_MODEL || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    baseUrl: process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.EMAIL_FROM || 'FollowLoop.ai <onboarding@resend.dev>',
  },
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
});
