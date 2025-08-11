import { ethers } from 'ethers';

// Get environment variables (in production, these would be passed from server)
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
const CONTRACT_ABI = import.meta.env.VITE_CONTRACT_ABI || '[]';
const ETHEREUM_RPC_URL = import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://ethereum-mainnet.s.alchemy.com/v2/demo';

// Parse ABI from environment variable
let parsedABI: any[];
try {
  parsedABI = JSON.parse(CONTRACT_ABI || '[]');
} catch (error) {
  console.error('Failed to parse CONTRACT_ABI:', error);
  parsedABI = [];
}

// Initialize provider
const provider = new ethers.JsonRpcProvider(ETHEREUM_RPC_URL);

// Contract interface
export interface CertificateData {
  studentName: string;
  institutionName: string;
  courseName: string;
  grade: string;
  issueDate: number;
  ipfsHash: string;
  isValid: boolean;
  issuedBy: string;
  completionDate: number;
  certificateType: string;
}

export class BlockchainService {
  private contract: ethers.Contract;
  private signer: ethers.Signer | null = null;

  constructor() {
    // Initialize with minimal contract setup - actual calls will be made through connected signer
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, parsedABI, provider);
  }

  // Connect wallet and get signer
  async connectWallet(): Promise<string> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Create provider from MetaMask
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await web3Provider.getSigner();
      
      // Connect contract with signer for write operations
      this.contract = this.contract.connect(this.signer) as ethers.Contract;

      return accounts[0];
    } catch (error: any) {
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  // Check if wallet is connected
  async isWalletConnected(): Promise<boolean> {
    try {
      if (typeof window.ethereum === 'undefined') return false;
      
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0;
    } catch {
      return false;
    }
  }

  // Get current wallet address
  async getWalletAddress(): Promise<string | null> {
    try {
      if (typeof window.ethereum === 'undefined') return null;
      
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0 ? accounts[0] : null;
    } catch {
      return null;
    }
  }

  // Issue a new certificate on-chain (for institutions)
  async issueCertificate(
    studentAddress: string,
    studentName: string,
    courseName: string,
    grade: string,
    ipfsHash: string,
    completionDate: number,
    certificateType: string
  ): Promise<number> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await this.contract.issueCertificate(
        studentAddress,
        studentName,
        courseName,
        grade,
        ipfsHash,
        completionDate,
        certificateType
      );

      const receipt = await tx.wait();
      
      // Get the token ID from the event
      const event = receipt.logs.find((log: any) => {
        try {
          const decoded = this.contract.interface.parseLog(log);
          return decoded?.name === 'CertificateIssued';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const decodedEvent = this.contract.interface.parseLog(event);
        if (decodedEvent && decodedEvent.args) {
          return Number(decodedEvent.args.tokenId);
        }
      }
      
      throw new Error('Certificate issued but token ID not found');
    } catch (error: any) {
      throw new Error(`Failed to issue certificate: ${error.message}`);
    }
  }

  // Verify a certificate exists on-chain by token ID
  async verifyCertificate(tokenId: number): Promise<CertificateData | null> {
    try {
      const certificateData = await this.contract.verifyCertificate(tokenId);
      
      // Check if certificate exists
      if (!certificateData || !certificateData.isValid) {
        return null;
      }

      return {
        studentName: certificateData.studentName,
        institutionName: certificateData.institutionName,
        courseName: certificateData.courseName,
        grade: certificateData.grade,
        issueDate: Number(certificateData.issueDate),
        ipfsHash: certificateData.ipfsHash,
        isValid: certificateData.isValid,
        issuedBy: certificateData.issuedBy,
        completionDate: Number(certificateData.completionDate),
        certificateType: certificateData.certificateType
      };
    } catch (error: any) {
      throw new Error(`Failed to verify certificate: ${error.message}`);
    }
  }

  // Verify a certificate by IPFS hash
  async verifyCertificateByIPFS(ipfsHash: string): Promise<{ exists: boolean; tokenId: number; certificate: CertificateData | null }> {
    try {
      const result = await this.contract.verifyCertificateByIPFS(ipfsHash);
      
      if (!result.exists) {
        return { exists: false, tokenId: 0, certificate: null };
      }

      const certificate = {
        studentName: result.cert.studentName,
        institutionName: result.cert.institutionName,
        courseName: result.cert.courseName,
        grade: result.cert.grade,
        issueDate: Number(result.cert.issueDate),
        ipfsHash: result.cert.ipfsHash,
        isValid: result.cert.isValid,
        issuedBy: result.cert.issuedBy,
        completionDate: Number(result.cert.completionDate),
        certificateType: result.cert.certificateType
      };

      return { 
        exists: true, 
        tokenId: Number(result.tokenId), 
        certificate 
      };
    } catch (error: any) {
      throw new Error(`Failed to verify certificate by IPFS: ${error.message}`);
    }
  }

  // Get all certificates for a student address
  async getCertificatesByStudent(studentAddress: string): Promise<number[]> {
    try {
      const certificateIds = await this.contract.getStudentCertificates(studentAddress);
      return certificateIds.map((id: any) => Number(id));
    } catch (error: any) {
      throw new Error(`Failed to get student certificates: ${error.message}`);
    }
  }

  // Get institution statistics
  async getInstitutionStats(institutionAddress: string): Promise<{
    name: string;
    isAuthorized: boolean;
    registrationDate: number;
    certificatesIssued: number;
  }> {
    try {
      const stats = await this.contract.getInstitutionStats(institutionAddress);
      return {
        name: stats[0],
        isAuthorized: stats[1],
        registrationDate: Number(stats[2]),
        certificatesIssued: Number(stats[3])
      };
    } catch (error: any) {
      throw new Error(`Failed to get institution stats: ${error.message}`);
    }
  }

  // Register an institution
  async registerInstitution(name: string, email: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await this.contract.registerInstitution(name, email);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error: any) {
      throw new Error(`Failed to register institution: ${error.message}`);
    }
  }

  // Update institution information
  async updateInstitutionInfo(newName: string, newEmail: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await this.contract.updateInstitutionInfo(newName, newEmail);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error: any) {
      throw new Error(`Failed to update institution info: ${error.message}`);
    }
  }

  // Revoke a certificate (set as invalid)
  async revokeCertificate(tokenId: number): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await this.contract.revokeCertificate(tokenId);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error: any) {
      throw new Error(`Failed to revoke certificate: ${error.message}`);
    }
  }

  // Batch issue certificates
  async batchIssueCertificates(
    students: string[],
    studentNames: string[],
    courseNames: string[],
    grades: string[],
    ipfsHashes: string[],
    completionDates: number[],
    certificateTypes: string[]
  ): Promise<number[]> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await this.contract.batchIssueCertificates(
        students,
        studentNames,
        courseNames,
        grades,
        ipfsHashes,
        completionDates,
        certificateTypes
      );

      const receipt = await tx.wait();
      
      // Get the token IDs from the events
      const events = receipt.logs.filter((log: any) => {
        try {
          const decoded = this.contract.interface.parseLog(log);
          return decoded?.name === 'CertificateIssued';
        } catch {
          return false;
        }
      });
      
      return events.map((event: any) => {
        const decodedEvent = this.contract.interface.parseLog(event);
        if (decodedEvent && decodedEvent.args) {
          return Number(decodedEvent.args.tokenId);
        }
        return 0;
      }).filter(id => id > 0);
    } catch (error: any) {
      throw new Error(`Failed to batch issue certificates: ${error.message}`);
    }
  }

  // Get the contract address
  getContractAddress(): string {
    return CONTRACT_ADDRESS;
  }

  // Get total number of certificates
  async getTotalCertificates(): Promise<number> {
    try {
      const total = await this.contract.getTotalCertificates();
      return Number(total);
    } catch (error: any) {
      throw new Error(`Failed to get total certificates: ${error.message}`);
    }
  }

  // Check if IPFS hash exists
  async checkIPFSHashExists(ipfsHash: string): Promise<boolean> {
    try {
      const exists = await this.contract.ipfsHashExists(ipfsHash);
      return exists;
    } catch (error: any) {
      throw new Error(`Failed to check IPFS hash: ${error.message}`);
    }
  }

  // Get network information
  async getNetworkInfo(): Promise<{ chainId: number; name: string }> {
    try {
      const network = await provider.getNetwork();
      return {
        chainId: Number(network.chainId),
        name: network.name
      };
    } catch (error: any) {
      throw new Error(`Failed to get network info: ${error.message}`);
    }
  }

  // Switch to the correct network
  async switchToCorrectNetwork(targetChainId: string): Promise<void> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        throw new Error('Please add this network to your wallet first');
      }
      throw new Error(`Failed to switch network: ${error.message}`);
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();