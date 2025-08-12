import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from 'multer';

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

  // In-memory storage for certificates (in production, use a database)
  const certificates: any[] = [];

  // Certificate issuance endpoint with proper multer configuration
  app.post('/api/certificates/issue', upload.single('certificateFile'), async (req, res) => {
    // For now, skip authentication in development
    // In production, you would verify JWT token here
    console.log('=== Certificate Issuance Request ===');
    console.log('Headers:', req.headers);
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    try {
      console.log('Certificate issuance request received');
      console.log('Request body:', req.body);
      console.log('File:', req.file);
      
      const {
        studentAddress,
        studentName,
        studentEmail,
        courseName,
        grade,
        completionDate,
        description
      } = req.body;
      
      // Validate required fields
      if (!studentAddress || !studentName || !courseName) {
        return res.status(400).json({ 
          error: 'Missing required fields: studentAddress, studentName, courseName' 
        });
      }
      
      // Check for file
      if (!req.file) {
        return res.status(400).json({ error: 'Certificate file is required.' });
      }
      
      // For now, simulate IPFS upload (replace with actual IPFS service)
      const mockIpfsHash = `QmX${Math.random().toString(36).substr(2, 44)}`;
      
      // Create certificate object
      const certificate = {
        id: Date.now().toString(),
        studentAddress,
        studentName,
        studentEmail,
        courseName,
        grade: grade || 'N/A',
        completionDate: completionDate || new Date().toISOString(),
        description: description || '',
        ipfsHash: mockIpfsHash,
        issuedAt: new Date().toISOString(),
        isValid: true,
        isMinted: false,
        certificateType: 'Academic',
        issuedBy: 'mock-institution-id',
        institutionName: 'Mock Institution'
      };
      
      // Store certificate in memory
      certificates.push(certificate);
      
      console.log('Certificate stored successfully. Total certificates:', certificates.length);
      console.log('Certificate details:', certificate);
      
      res.json({
        message: 'Certificate issued successfully. Student can now mint it to blockchain.',
        certificate,
        id: certificate.id
      });
      
    } catch (error) {
      console.error('Certificate issuance error:', error);
      res.status(500).json({
        error: 'Internal server error during certificate issuance'
      });
    }
  });

  // Get institution certificates endpoint
  app.get('/api/certificates/institution', async (req, res) => {
    try {
      console.log('=== Fetching Institution Certificates ===');
      console.log('Total certificates in memory:', certificates.length);
      console.log('Certificates:', certificates);
      res.json({ certificates });
    } catch (error) {
      console.error('Get certificates error:', error);
      res.status(500).json({
        error: 'Internal server error while fetching certificates'
      });
    }
  });

  // Get dashboard stats endpoint
  app.get('/api/stats', async (req, res) => {
    try {
      console.log('Fetching dashboard stats');
      const stats = {
        totalCertificates: certificates.length,
        activeCertificates: certificates.filter(c => c.isValid).length,
        revokedCertificates: certificates.filter(c => !c.isValid).length,
        certificatesByType: [
          { _id: 'Academic', count: certificates.filter(c => c.certificateType === 'Academic').length },
          { _id: 'Professional', count: certificates.filter(c => c.certificateType === 'Professional').length },
          { _id: 'Training', count: certificates.filter(c => c.certificateType === 'Training').length }
        ]
      };
      res.json(stats);
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        error: 'Internal server error while fetching stats'
      });
    }
  });

  // Get current subscription endpoint
  app.get('/api/subscription/current', async (req, res) => {
    try {
      console.log('Fetching current subscription');
      res.json({
        subscription: {
          planId: 'basic',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30*24*60*60*1000).toISOString()
        },
        usage: {
          certificatesThisMonth: certificates.length,
          storageUsed: 0.5,
          apiCallsThisMonth: 234
        }
      });
    } catch (error) {
      console.error('Get subscription error:', error);
      res.status(500).json({
        error: 'Internal server error while fetching subscription'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
