import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { connectDatabase } from './src/utils/database';
import authRoutes from './src/routes/auth';
import pollutionRoutes from './src/routes/pollution';
import { initializeSocket } from './src/socket';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposeHeaders: ['Content-Length', 'X-Request-Id']
}));

// Health check
app.get('/', (c) => {
  return c.json({ message: 'Field incident reporting API is running' });
});

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/reports', pollutionRoutes);

// Error handler
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json(
    { error: 'Internal Server Error' },
    500
  );
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Start server
async function startServer() {
  try {
    await connectDatabase();
    
    const port = process.env.PORT || 3002;
    console.log(`Server is running on port ${port}`);
    
    const server = serve({
      fetch: app.fetch,
      port: Number(port)
    });

    initializeSocket(server);

    console.log(`🚀 Field incident reporting API ready at http://localhost:${port}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch((error: Error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
