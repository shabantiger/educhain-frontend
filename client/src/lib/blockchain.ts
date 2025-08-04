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
  id: string;
  studentAddress: string;
  institutionAddress: string;
  studentName: string;
  courseName: string;
  issueDate: number;
  ipfsHash: string;
  isValid: boolean;
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

  // Mint a new certificate on-chain
  async mintCertificate(
    certificateId: string,
    studentAddress: string,
    studentName: string,
    courseName: string,
    ipfsHash: string
  ): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await this.contract.mintCertificate(
        certificateId,
        studentAddress,
        studentName,
        courseName,
        ipfsHash
      );

      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error: any) {
      throw new Error(`Failed to mint certificate: ${error.message}`);
    }
  }

  // Verify a certificate exists on-chain
  async verifyCertificate(certificateId: string): Promise<CertificateData | null> {
    try {
      const certificateData = await this.contract.getCertificate(certificateId);
      
      // Check if certificate exists (assuming the contract returns default values for non-existent certificates)
      if (!certificateData || certificateData.studentAddress === ethers.ZeroAddress) {
        return null;
      }

      return {
        id: certificateId,
        studentAddress: certificateData.studentAddress,
        institutionAddress: certificateData.institutionAddress,
        studentName: certificateData.studentName,
        courseName: certificateData.courseName,
        issueDate: Number(certificateData.issueDate),
        ipfsHash: certificateData.ipfsHash,
        isValid: certificateData.isValid
      };
    } catch (error: any) {
      throw new Error(`Failed to verify certificate: ${error.message}`);
    }
  }

  // Get all certificates for a student address
  async getCertificatesByStudent(studentAddress: string): Promise<CertificateData[]> {
    try {
      const certificateIds = await this.contract.getCertificatesByStudent(studentAddress);
      const certificates: CertificateData[] = [];

      for (const id of certificateIds) {
        const cert = await this.verifyCertificate(id);
        if (cert) {
          certificates.push(cert);
        }
      }

      return certificates;
    } catch (error: any) {
      throw new Error(`Failed to get certificates: ${error.message}`);
    }
  }

  // Get all certificates issued by an institution
  async getCertificatesByInstitution(institutionAddress: string): Promise<CertificateData[]> {
    try {
      const certificateIds = await this.contract.getCertificatesByInstitution(institutionAddress);
      const certificates: CertificateData[] = [];

      for (const id of certificateIds) {
        const cert = await this.verifyCertificate(id);
        if (cert) {
          certificates.push(cert);
        }
      }

      return certificates;
    } catch (error: any) {
      throw new Error(`Failed to get institution certificates: ${error.message}`);
    }
  }

  // Revoke a certificate (set as invalid)
  async revokeCertificate(certificateId: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await this.contract.revokeCertificate(certificateId);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error: any) {
      throw new Error(`Failed to revoke certificate: ${error.message}`);
    }
  }

  // Get the contract address
  getContractAddress(): string {
    return CONTRACT_ADDRESS;
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