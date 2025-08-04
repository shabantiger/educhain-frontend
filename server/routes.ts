import type { Express } from "express";
import { createServer, type Server } from "http";
import { serverBlockchainService, getBlockchainConfig } from "./blockchain";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Blockchain configuration endpoint
  app.get('/api/blockchain/config', (req, res) => {
    try {
      const config = getBlockchainConfig();
      res.json({
        contractAddress: config.contractAddress,
        rpcUrl: config.rpcUrl,
        hasABI: config.contractABI.length > 0
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Certificate verification endpoint
  app.get('/api/blockchain/certificate/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const certificate = await serverBlockchainService.verifyCertificate(id);
      
      if (!certificate) {
        return res.status(404).json({ error: 'Certificate not found' });
      }
      
      res.json({ certificate });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get certificates by student address
  app.get('/api/blockchain/certificates/student/:address', async (req, res) => {
    try {
      const { address } = req.params;
      const certificates = await serverBlockchainService.getCertificatesByStudent(address);
      res.json({ certificates });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get certificates by institution address
  app.get('/api/blockchain/certificates/institution/:address', async (req, res) => {
    try {
      const { address } = req.params;
      const certificates = await serverBlockchainService.getCertificatesByInstitution(address);
      res.json({ certificates });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get network information
  app.get('/api/blockchain/network', async (req, res) => {
    try {
      const networkInfo = await serverBlockchainService.getNetworkInfo();
      res.json(networkInfo);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
