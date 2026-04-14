import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { env, validateEnv } from './config/env.js';
import { socketService } from './websocket/socket.js';
import applicationRoutes from './routes/applications.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import credentialRoutes from './routes/credentials.routes.js';
import discoveryRoutes from './routes/discovery.routes.js';

// Validate environment variables
validateEnv();

const app = express();
const httpServer = createServer(app);
const port = env.PORT;

// Initialize WebSocket Service
socketService.init(httpServer);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Applier Server is running' });
});

// API Routes
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/resume', resumeRoutes);
app.use('/api/v1/credentials', credentialRoutes);
app.use('/api/v1/discovery', discoveryRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

httpServer.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});

export default app;
