import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wallet, 
  Shield, 
  Eye, 
  Share, 
  Download, 
  Search,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Coins,
  Loader2
} from "lucide-react";
import { Link } from "wouter";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { format } from "date-fns";

export default function StudentPortal() {
  const [verificationId, setVerificationId] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { 
    isConnected, 
    walletAddress, 
    certificates, 
    connect, 
    isLoading,
    verifyCertificate,
    mintCertificate
  } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for student's issued certificates (from backend)
  const { data: issuedCertificates = [], isLoading: loadingIssued } = useQuery({
    queryKey: ["student-certificates", walletAddress],
    queryFn: () => api.getCertificatesByWallet(walletAddress!),
    enabled: isConnected && !!walletAddress,
  });

  // Mint certificate mutation
  const mintCertificateMutation = useMutation({
    mutationFn: async (certificate: any) => {
      if (!isConnected || !walletAddress) {
        throw new Error("Please connect your wallet first");
      }

      // Mint certificate on blockchain
      const txHash = await mintCertificate(
        certificate.id,
        walletAddress,
        certificate.studentName,
        certificate.courseName,
        certificate.ipfsHash || `ipfs_${certificate.id}`
      );

      // Update certificate status in backend
      await api.mintCertificateToBlockchain(certificate.id, {
        tokenId: Date.now(), // In production, extract from transaction receipt
        walletAddress: walletAddress,
        transactionHash: txHash
      });

      return { txHash, certificateId: certificate.id };
    },
    onSuccess: (data) => {
      toast({
        title: "Certificate minted successfully!",
        description: `Certificate has been minted to the blockchain. Transaction: ${data.txHash.slice(0, 10)}...`,
      });
      
      // Refetch certificates to update status
      queryClient.invalidateQueries({ queryKey: ["student-certificates"] });
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to mint certificate",
        description: error.message || "An error occurred while minting the certificate.",
        variant: "destructive",
      });
    },
  });

  const handleVerification = async () => {
    if (!verificationId.trim()) return;
    
    setIsVerifying(true);
    try {
      const result = await verifyCertificate(verificationId.trim());
      setVerificationResult(result);
    } catch (error: any) {
      setVerificationResult({
        valid: false,
        error: error.message || "Certificate not found or invalid"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-neutral-900" data-testid="portal-title">
                  Student Portal
                </h1>
                <span className="text-xs text-neutral-500">Verify & View Certificates</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          /* Wallet Connection */
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Wallet className="w-10 h-10 text-primary" />
                </div>
                
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                  Connect Your Wallet
                </h2>
                <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                  Connect your blockchain wallet to access your certificates and verify your credentials securely.
                </p>
                
                <Button 
                  size="lg"
                  onClick={connect}
                  disabled={isLoading}
                  className="min-w-[200px]"
                  data-testid="connect-wallet-btn"
                >
                  {isLoading ? "Connecting..." : "Connect Wallet"}
                </Button>
                
                <div className="mt-6 text-sm text-neutral-500">
                  <p>Supported wallets: MetaMask, WalletConnect, Coinbase Wallet</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Connected Wallet Dashboard */
          <div className="space-y-8">
            {/* Connection Status */}
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Wallet Connected</strong>
                    <div className="font-mono text-sm mt-1" data-testid="connected-wallet">
                      {walletAddress}
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Student Certificates */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Your Certificates</h2>
              
              {/* Show issued certificates waiting to be minted */}
              {issuedCertificates.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-neutral-700 mb-4">Available to Mint</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {issuedCertificates.filter((cert: any) => !cert.isMinted).map((certificate: any) => (
                      <Card key={certificate.id} className="border-blue-200 bg-blue-50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-blue-900">{certificate.courseName}</h4>
                              <p className="text-sm text-blue-700">{certificate.institutionName}</p>
                              <p className="text-xs text-blue-600">Grade: {certificate.grade}</p>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Ready to Mint
                            </Badge>
                          </div>
                          
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => mintCertificateMutation.mutate(certificate)}
                            disabled={mintCertificateMutation.isPending}
                            data-testid={`mint-certificate-${certificate.id}`}
                          >
                            {mintCertificateMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Minting...
                              </>
                            ) : (
                              <>
                                <Coins className="w-4 h-4 mr-2" />
                                Mint to Blockchain
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <h3 className="text-lg font-medium text-neutral-700 mb-4">Minted Certificates</h3>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-32 w-full mb-4" />
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <div className="flex space-x-2">
                          <Skeleton className="h-8 flex-1" />
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : certificates.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-6 h-6 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">No certificates found</h3>
                    <p className="text-neutral-500">
                      No certificates have been issued to this wallet address yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((certificate: any) => (
                    <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        {/* Certificate Preview */}
                        <div className="certificate-preview mb-4">
                          <div className="text-2xl mb-2">🎓</div>
                          <h3 className="font-bold text-neutral-900 mb-1" data-testid={`certificate-course-${certificate.id}`}>
                            {certificate.courseName}
                          </h3>
                          <p className="text-sm text-neutral-600 mb-2" data-testid={`certificate-institution-${certificate.id}`}>
                            {certificate.institutionName}
                          </p>
                          <p className="text-xs text-neutral-500">
                            Issued: {format(new Date(certificate.issuedAt), "MMMM dd, yyyy")}
                          </p>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-500">Grade:</span>
                            <span className="text-neutral-900">{certificate.grade}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-500">Type:</span>
                            <span className="text-neutral-900">{certificate.certificateType}</span>
                          </div>
                          {certificate.tokenId && (
                            <div className="flex justify-between text-sm">
                              <span className="text-neutral-500">Token ID:</span>
                              <span className="text-neutral-900 font-mono">#{certificate.tokenId}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-500">Status:</span>
                            <Badge className="bg-green-100 text-green-800">
                              {certificate.isMinted ? "Verified ✓" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1" data-testid={`view-certificate-${certificate.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" data-testid={`share-certificate-${certificate.id}`}>
                            <Share className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                          <Button size="sm" variant="outline" data-testid={`download-certificate-${certificate.id}`}>
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Certificate Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Verify a Certificate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">
                  Enter a certificate ID or blockchain hash to verify its authenticity.
                </p>
                
                <div className="flex space-x-3 mb-4">
                  <Input
                    placeholder="Enter certificate ID or hash..."
                    value={verificationId}
                    onChange={(e) => setVerificationId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleVerification()}
                    data-testid="verification-input"
                  />
                  <Button 
                    onClick={handleVerification}
                    disabled={isVerifying || !verificationId.trim()}
                    data-testid="verify-button"
                  >
                    {isVerifying ? "Verifying..." : "Verify"}
                  </Button>
                </div>

                {/* Verification Result */}
                {verificationResult && (
                  <Alert className={verificationResult.valid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    {verificationResult.valid ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={verificationResult.valid ? "text-green-800" : "text-red-800"}>
                      {verificationResult.valid ? (
                        <div>
                          <strong>Certificate Verified ✓</strong>
                          <div className="mt-2 space-y-1 text-sm">
                            <div><strong>Course:</strong> {verificationResult.certificate.courseName}</div>
                            <div><strong>Student:</strong> {verificationResult.certificate.studentName}</div>
                            <div><strong>Institution:</strong> {verificationResult.certificate.institutionName}</div>
                            <div><strong>Issue Date:</strong> {format(new Date(verificationResult.certificate.issuedAt), "MMMM dd, yyyy")}</div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <strong>Verification Failed</strong>
                          <div className="mt-1 text-sm">{verificationResult.error}</div>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
