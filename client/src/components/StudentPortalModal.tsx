import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Share, 
  Download, 
  Shield
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { format } from "date-fns";

interface StudentPortalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StudentPortalModal({ open, onOpenChange }: StudentPortalModalProps) {
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
    error 
  } = useWallet();

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Portal</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!isConnected ? (
            /* Wallet Connection Section */
            <div className="text-center py-8">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Connect Your Wallet</h3>
                <p className="text-neutral-600 mb-6">
                  Connect your blockchain wallet to access your certificates and verify your credentials.
                </p>
                
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  size="lg"
                  onClick={connect}
                  disabled={isLoading}
                  className="min-w-[200px]"
                  data-testid="connect-wallet-btn"
                >
                  {isLoading ? "Connecting..." : "Connect Wallet"}
                </Button>
                
                <div className="mt-4 text-sm text-neutral-500">
                  <p>Supported wallets: MetaMask, WalletConnect, Coinbase Wallet</p>
                </div>
              </div>
            </div>
          ) : (
            /* Connected Dashboard */
            <div className="space-y-6">
              {/* Connection Status */}
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div>
                    <strong>Wallet Connected</strong>
                    <div className="font-mono text-sm mt-1" data-testid="connected-wallet">
                      {walletAddress}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Student Certificates */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Your Certificates</h3>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <Skeleton className="h-24 w-full mb-4" />
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
                    <CardContent className="p-8 text-center">
                      <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-6 h-6 text-neutral-400" />
                      </div>
                      <h4 className="text-lg font-medium text-neutral-900 mb-2">No certificates found</h4>
                      <p className="text-neutral-500">
                        No certificates have been issued to this wallet address yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certificates.map((certificate: any) => (
                      <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          {/* Certificate Preview */}
                          <div className="certificate-preview mb-4">
                            <div className="text-2xl font-bold text-neutral-800 mb-2">🎓</div>
                            <h4 className="font-bold text-neutral-900 mb-1" data-testid={`certificate-course-${certificate.id}`}>
                              {certificate.courseName}
                            </h4>
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
                              <Badge className={`${certificate.isMinted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
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
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Verify a Certificate
                  </h3>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
