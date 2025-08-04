import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { blockchainService, type CertificateData } from "@/lib/blockchain";
import { useToast } from "@/hooks/use-toast";

// Declare global ethereum object for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { toast } = useToast();

  // Query for certificates when wallet is connected - use API fallback
  const { data: certificates, isLoading: certificatesLoading, refetch: refetchCertificates } = useQuery({
    queryKey: ["certificates", walletAddress],
    queryFn: async () => {
      try {
        // Try blockchain service first
        return await blockchainService.getCertificatesByStudent(walletAddress);
      } catch (error) {
        // Fallback to API endpoint
        const response = await fetch(`/api/blockchain/certificates/student/${walletAddress}`);
        if (!response.ok) throw new Error('Failed to fetch certificates');
        const data = await response.json();
        return data.certificates || [];
      }
    },
    enabled: isConnected && !!walletAddress,
  });

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await blockchainService.isWalletConnected();
        if (connected) {
          const address = await blockchainService.getWalletAddress();
          if (address) {
            setWalletAddress(address);
            setIsConnected(true);
          }
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setWalletAddress("");
        } else {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const connect = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Check if MetaMask is available
      if (typeof window.ethereum === 'undefined') {
        // Demo mode for Replit environment without MetaMask
        const demoAddress = "0xe7eb456ea5b021b9f1f037505e1582ffa07b6c4d";
        setWalletAddress(demoAddress);
        setIsConnected(true);
        
        toast({
          title: "Demo wallet connected",
          description: "Connected to demo wallet for testing. In production, install MetaMask to connect your real wallet.",
        });
        return;
      }

      const address = await blockchainService.connectWallet();
      setWalletAddress(address);
      setIsConnected(true);
      
      toast({
        title: "Wallet connected",
        description: "Successfully connected to your wallet and blockchain.",
      });
    } catch (error: any) {
      // Provide fallback demo mode if blockchain connection fails
      if (error.message.includes("MetaMask") || error.message.includes("extension not found")) {
        const demoAddress = "0xe7eb456ea5b021b9f1f037505e1582ffa07b6c4d";
        setWalletAddress(demoAddress);
        setIsConnected(true);
        
        toast({
          title: "Demo wallet connected",
          description: "MetaMask not found. Using demo wallet for testing. Install MetaMask for real blockchain interaction.",
        });
      } else {
        setError(error.message || "Failed to connect wallet");
        toast({
          title: "Connection failed",
          description: error.message || "Failed to connect to your wallet. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setWalletAddress("");
    setError("");
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  const verifyCertificate = async (certificateId: string) => {
    try {
      // Try blockchain service first
      const result = await blockchainService.verifyCertificate(certificateId);
      return result;
    } catch (error: any) {
      // Fallback to API endpoint
      try {
        const response = await fetch(`/api/blockchain/certificate/${certificateId}`);
        if (!response.ok) throw new Error('Certificate not found');
        const data = await response.json();
        return data.certificate;
      } catch (apiError: any) {
        throw new Error(error.message || "Failed to verify certificate");
      }
    }
  };

  const mintCertificate = async (
    certificateId: string,
    studentAddress: string,
    studentName: string,
    courseName: string,
    ipfsHash: string
  ) => {
    try {
      // Check if MetaMask is available
      if (typeof window.ethereum === 'undefined') {
        // Demo mode - simulate transaction
        const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        
        toast({
          title: "Demo minting simulation",
          description: "Certificate minting simulated successfully. In production, this would be a real blockchain transaction.",
        });
        
        return mockTxHash;
      }

      const txHash = await blockchainService.mintCertificate(
        certificateId,
        studentAddress,
        studentName,
        courseName,
        ipfsHash
      );
      
      // Refetch certificates after minting
      await refetchCertificates();
      
      return txHash;
    } catch (error: any) {
      // Fallback to demo mode if blockchain fails
      if (error.message.includes("MetaMask") || error.message.includes("extension not found")) {
        const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        
        toast({
          title: "Demo minting simulation",
          description: "MetaMask not available. Certificate minting simulated for demo purposes.",
        });
        
        return mockTxHash;
      }
      
      throw new Error(error.message || "Failed to mint certificate");
    }
  };

  const revokeCertificate = async (certificateId: string) => {
    try {
      const txHash = await blockchainService.revokeCertificate(certificateId);
      
      // Refetch certificates after revoking
      await refetchCertificates();
      
      return txHash;
    } catch (error: any) {
      throw new Error(error.message || "Failed to revoke certificate");
    }
  };

  const switchNetwork = async (chainId: string) => {
    try {
      await blockchainService.switchToCorrectNetwork(chainId);
    } catch (error: any) {
      throw new Error(error.message || "Failed to switch network");
    }
  };

  const getNetworkInfo = async () => {
    try {
      return await blockchainService.getNetworkInfo();
    } catch (error: any) {
      throw new Error(error.message || "Failed to get network info");
    }
  };

  return {
    isConnected,
    walletAddress,
    certificates: certificates || [],
    isLoading: isLoading || certificatesLoading,
    error,
    connect,
    disconnect,
    verifyCertificate,
    mintCertificate,
    revokeCertificate,
    switchNetwork,
    getNetworkInfo,
    refetchCertificates,
  };
}
