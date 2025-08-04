import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
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

  // Query for certificates when wallet is connected
  const { data: certificatesData, isLoading: certificatesLoading } = useQuery({
    queryKey: ["/api/certificates/wallet", walletAddress],
    queryFn: () => api.getCertificatesByWallet(walletAddress),
    enabled: isConnected && !!walletAddress,
  });

  const certificates = certificatesData?.certificates || [];

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
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
    if (typeof window.ethereum === 'undefined') {
      setError("MetaMask is not installed. Please install MetaMask and try again.");
      toast({
        title: "Wallet not found",
        description: "Please install MetaMask or another Web3 wallet to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please check your wallet.");
      }

      const address = accounts[0];
      setWalletAddress(address);

      // Try to connect with the backend
      try {
        await api.connectWallet(address);
        setIsConnected(true);
        toast({
          title: "Wallet connected",
          description: "Successfully connected to your wallet and verified certificates.",
        });
      } catch (apiError: any) {
        // If API connection fails, still allow wallet connection for verification
        if (apiError.status === 404) {
          setIsConnected(true);
          toast({
            title: "Wallet connected",
            description: "Wallet connected successfully. No certificates found for this address.",
          });
        } else {
          throw apiError;
        }
      }
    } catch (error: any) {
      setError(error.message || "Failed to connect wallet");
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to your wallet. Please try again.",
        variant: "destructive",
      });
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
      const result = await api.verifyCertificate(certificateId);
      return result;
    } catch (error: any) {
      throw new Error(error.message || "Failed to verify certificate");
    }
  };

  const switchNetwork = async (chainId: string) => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error("MetaMask is not installed");
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        throw new Error("Please add this network to your wallet first");
      }
      throw error;
    }
  };

  return {
    isConnected,
    walletAddress,
    certificates,
    isLoading: isLoading || certificatesLoading,
    error,
    connect,
    disconnect,
    verifyCertificate,
    switchNetwork,
  };
}
