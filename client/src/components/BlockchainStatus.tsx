import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Link as LinkIcon,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ExternalLink
} from "lucide-react";

interface BlockchainConfig {
  contractAddress: string;
  rpcUrl: string;
  hasABI: boolean;
}

interface NetworkInfo {
  chainId: number;
  name: string;
}

export default function BlockchainStatus() {
  const [config, setConfig] = useState<BlockchainConfig | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchBlockchainStatus = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Fetch blockchain configuration
      const configResponse = await fetch('/api/blockchain/config');
      if (!configResponse.ok) throw new Error('Failed to fetch blockchain config');
      const configData = await configResponse.json();
      setConfig(configData);

      // Fetch network information
      const networkResponse = await fetch('/api/blockchain/network');
      if (!networkResponse.ok) throw new Error('Failed to fetch network info');
      const networkData = await networkResponse.json();
      setNetworkInfo(networkData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch blockchain status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockchainStatus();
  }, []);

  const getStatusBadge = () => {
    if (isLoading) return <Badge variant="secondary">Checking...</Badge>;
    if (error) return <Badge variant="destructive">Error</Badge>;
    if (config && config.contractAddress && config.hasABI) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge>;
    }
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Configuration Needed</Badge>;
  };

  const openInExplorer = () => {
    if (config?.contractAddress && networkInfo) {
      // Default to Etherscan for mainnet, adjust based on network
      const explorerUrl = networkInfo.chainId === 1 
        ? `https://etherscan.io/address/${config.contractAddress}`
        : `https://etherscan.io/address/${config.contractAddress}`;
      window.open(explorerUrl, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          Blockchain Status
        </CardTitle>
        {getStatusBadge()}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={fetchBlockchainStatus}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : config ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Smart Contract Configured</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Contract:</span>
                <div className="font-mono text-xs break-all text-gray-600">
                  {config.contractAddress}
                  {config.contractAddress !== '0x0000000000000000000000000000000000000000' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-1"
                      onClick={openInExplorer}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
              
              {networkInfo && (
                <div>
                  <span className="font-medium">Network:</span>
                  <span className="ml-2">{networkInfo.name} (Chain ID: {networkInfo.chainId})</span>
                </div>
              )}
              
              <div>
                <span className="font-medium">ABI:</span>
                <span className="ml-2">{config.hasABI ? 'Loaded' : 'Missing'}</span>
              </div>
            </div>

            {(!config.hasABI || config.contractAddress === '0x0000000000000000000000000000000000000000') && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please ensure CONTRACT_ADDRESS and CONTRACT_ABI environment variables are properly configured.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}