import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for this frontend server
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'EduChain Frontend Server'
    });
  });

  // Configuration endpoint to provide frontend with deployment info
  app.get('/api/config', (req, res) => {
    res.json({
      backendUrl: process.env.VITE_API_URL || '',
      contractAddress: process.env.VITE_CONTRACT_ADDRESS || '',
      rpcUrl: process.env.VITE_ETHEREUM_RPC_URL || '',
      hasConfiguration: !!(process.env.VITE_API_URL && process.env.VITE_CONTRACT_ADDRESS)
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
