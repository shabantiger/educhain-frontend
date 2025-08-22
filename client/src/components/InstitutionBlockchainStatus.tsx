import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Shield,
  Network
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface InstitutionBlockchainData {
  institution: {
    name: string;
    email: string;
    walletAddress: string;
    backendVerified: boolean;
    blockchainRegistered: boolean;
  };
  blockchainStats: any;
  isAuthorizedOnChain: boolean;
  error?: string;
}

export default function InstitutionBlockchainStatus() {
  const [blockchainData, setBlockchainData] = useState<InstitutionBlockchainData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBlockchainStatus();
  }, []);

  const fetchBlockchainStatus = async () => {
    try {
      setLoading(true);
      // Get institution profile to get the ID
      const profile = await api.getProfile();
      const institutionId = profile.institution._id || profile.institution.id;
      
      // Get blockchain status
      const status = await api.getBlockchainStatus(institutionId);
      setBlockchainData(status);
    } catch (error: any) {
      console.error('Failed to fetch blockchain status:', error);
      toast({
        title: "Error",
        description: "Failed to load blockchain status. Please check your backend connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!blockchainData) return null;
    
    if (blockchainData.error) {
      return <Badge variant="destructive">Error</Badge>;
    }
    
    if (blockchainData.isAuthorizedOnChain) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Authorized</Badge>;
    }
    
    if (blockchainData.institution.blockchainRegistered) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Registered</Badge>;
    }
    
    if (blockchainData.institution.backendVerified) {
      return <Badge variant="outline">Pending Registration</Badge>;
    }
    
    return <Badge variant="outline" className="text-gray-500">Not Verified</Badge>;
  };

  const getStatusIcon = () => {
    if (!blockchainData) return <Clock className="h-5 w-5 text-gray-400" />;
    
    if (blockchainData.error) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    
    if (blockchainData.isAuthorizedOnChain) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    if (blockchainData.institution.blockchainRegistered) {
      return <Shield className="h-5 w-5 text-yellow-500" />;
    }
    
    if (blockchainData.institution.backendVerified) {
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    }
    
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  const getStatusMessage = () => {
    if (!blockchainData) return "Loading blockchain status...";
    
    if (blockchainData.error) {
      return "There was an error checking your blockchain status. Please contact support.";
    }
    
    if (blockchainData.isAuthorizedOnChain) {
      return "Your institution is fully authorized on the blockchain and can issue certificates.";
    }
    
    if (blockchainData.institution.blockchainRegistered) {
      return "Your institution is registered on the blockchain but awaiting authorization from admin.";
    }
    
    if (blockchainData.institution.backendVerified) {
      return "Your institution is verified but not yet registered on the blockchain. This will be done automatically by admin.";
    }
    
    return "Your institution needs to be verified before blockchain registration.";
  };

  if (loading) {
    return (
      <Card>
              <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Blockchain Status
        </CardTitle>
      </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Blockchain Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Overview */}
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">Blockchain Integration</span>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-muted-foreground">{getStatusMessage()}</p>
            </div>
          </div>

          {/* Institution Details */}
          {blockchainData && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Institution Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <span className="ml-2">{blockchainData.institution.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-2">{blockchainData.institution.email}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Wallet Address:</span>
                  <span className="ml-2 font-mono text-xs break-all">
                    {blockchainData.institution.walletAddress}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Status Details */}
          {blockchainData && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Status Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Backend Verified:</span>
                  {blockchainData.institution.backendVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Blockchain Registered:</span>
                  {blockchainData.institution.blockchainRegistered ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Blockchain Authorized:</span>
                  {blockchainData.isAuthorizedOnChain ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Blockchain Stats */}
          {blockchainData?.blockchainStats && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Blockchain Statistics</h4>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Registration Date:</span>
                    <span className="ml-2">
                      {blockchainData.blockchainStats.registrationDate > 0 
                        ? new Date(blockchainData.blockchainStats.registrationDate * 1000).toLocaleDateString()
                        : 'Not registered'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Certificates Issued:</span>
                    <span className="ml-2">{blockchainData.blockchainStats.certificatesIssued || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {blockchainData?.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Blockchain Error: {blockchainData.error}
              </AlertDescription>
            </Alert>
          )}

          {/* Information Alert */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Blockchain registration and authorization are handled automatically by the admin team. 
              If you have any questions about your status, please contact support.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
