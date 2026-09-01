const { validateEnvironment } = require('./config/env');
const { prisma } = require('./lib/prisma');
const { createApp } = require('./app');
const { createGeminiClient } = require('./lib/gemini');

validateEnvironment();

const port = Number(process.env.PORT || 4000);
const app = createApp(prisma, createGeminiClient());
const server = app.listen(port, '0.0.0.0', () => console.log(`Neutrilin API is listening on port ${port}`));

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
