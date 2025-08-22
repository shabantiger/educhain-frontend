import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, FileText, Hash, CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";

export default function Verify() {
  const [searchMethod, setSearchMethod] = useState<"ipfs" | "token" | "id">("ipfs");
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data: certificateData, isLoading, error, refetch } = useQuery({
    queryKey: ["certificate-verification", searchMethod, searchValue],
    queryFn: async () => {
      if (!searchValue.trim()) return null;
      
      try {
        console.log('Attempting verification with:', { searchMethod, searchValue });
        
        let result;
        if (searchMethod === "ipfs") {
          result = await api.verifyCertificateByIPFS(searchValue);
        } else if (searchMethod === "token") {
          result = await api.verifyCertificateByToken(parseInt(searchValue));
        } else {
          result = await api.verifyCertificate(searchValue);
        }
        
        console.log('Verification result:', result);
        return result;
      } catch (error: any) {
        console.error('Verification error:', error);
        throw new Error(error.message || 'Failed to verify certificate');
      }
    },
    enabled: false, // Don't auto-fetch, only on button clicks
  });

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    setIsSearching(true);
    try {
      await refetch();
    } finally {
      setIsSearching(false);
    }
  };

  const getVerificationStatus = (certificate: any) => {
    if (!certificate) return null;
    
    // Check if certificate exists and has data
    if (!certificate.studentName && !certificate.courseName) {
      return { status: "not_found", icon: XCircle, color: "text-red-600", bg: "bg-red-100", text: "Certificate Not Found" };
    }
    
    // Check if certificate is revoked
    if (certificate.isValid === false) {
      return { status: "revoked", icon: XCircle, color: "text-red-600", bg: "bg-red-100", text: "Certificate Revoked" };
    }
    
    // Check if certificate is minted on blockchain
    if (certificate.isMinted || certificate.tokenId) {
      return { status: "active", icon: CheckCircle, color: "text-green-600", bg: "bg-green-100", text: "Certificate Verified" };
    }
    
    // Certificate exists but not minted
    return { status: "pending", icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-100", text: "Certificate Pending Mint" };
  };

  const verificationStatus = getVerificationStatus(certificateData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-center items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900" data-testid="page-title">
            Certificate Verification
          </h1>
          <p className="text-neutral-600">Verify the authenticity of certificates using IPFS hash or token ID</p>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Verify Certificate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">How to verify certificates:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>IPFS Hash:</strong> Use the IPFS hash from the certificate (starts with "Qm")</li>
                <li>• <strong>Token ID:</strong> Use the blockchain token ID (numeric)</li>
                <li>• <strong>Certificate ID:</strong> Use the unique certificate identifier</li>
              </ul>
              <p className="text-xs text-blue-700 mt-2">
                Example IPFS Hash: QmZyAGfoTeib5JGv9bBZ6HYisgUPEAMskAF2z7PU7C7Yii
              </p>
            </div>
          </div>
          
          <Tabs value={searchMethod} onValueChange={(value) => setSearchMethod(value as "ipfs" | "token" | "id")}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ipfs" className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                IPFS Hash
              </TabsTrigger>
              <TabsTrigger value="token" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Token ID
              </TabsTrigger>
              <TabsTrigger value="id" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Certificate ID
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ipfs" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">IPFS Hash</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="QmX..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={isSearching || !searchValue.trim()}>
                    {isSearching ? (
                      <Skeleton className="w-4 h-4" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="token" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Token ID</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="123"
                    type="number"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={isSearching || !searchValue.trim()}>
                    {isSearching ? (
                      <Skeleton className="w-4 h-4" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="id" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Certificate ID</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="68a81ed08860581b9f838d51"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={isSearching || !searchValue.trim()}>
                    {isSearching ? (
                      <Skeleton className="w-4 h-4" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results Section */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Certificate Not Found</h3>
              <p className="text-neutral-500 mb-2">
                No certificate found with the provided {searchMethod === "ipfs" ? "IPFS hash" : searchMethod === "token" ? "token ID" : "certificate ID"}.
              </p>
              <p className="text-sm text-neutral-400">
                Please check the {searchMethod === "ipfs" ? "IPFS hash" : searchMethod === "token" ? "token ID" : "certificate ID"} and try again.
              </p>
              {searchMethod === "ipfs" && (
                <p className="text-xs text-neutral-400 mt-2">
                  Example: QmZyAGfoTeib5JGv9bBZ6HYisgUPEAMskAF2z7PU7C7Yii
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {certificateData && verificationStatus && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Verification Result</CardTitle>
              <Badge className={`${verificationStatus.bg} ${verificationStatus.color}`}>
                <verificationStatus.icon className="w-3 h-3 mr-1" />
                {verificationStatus.text}
              </Badge>
            </div>
          </CardHeader>
          
          {/* Debug Information */}
          <CardContent className="pb-0">
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                Debug Information (Click to expand)
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono">
                <pre>{JSON.stringify(certificateData, null, 2)}</pre>
              </div>
            </details>
          </CardContent>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Certificate Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Student Name:</span>
                    <span className="font-medium">{certificateData.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Course:</span>
                    <span className="font-medium">{certificateData.courseName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Grade:</span>
                    <span className="font-medium">{certificateData.grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Completion Date:</span>
                    <span className="font-medium">
                      {certificateData.completionDate ? 
                        format(new Date(certificateData.completionDate), "MMM dd, yyyy") : 
                        'Not available'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Issue Date:</span>
                    <span className="font-medium">
                      {certificateData.issuedAt ? 
                        format(new Date(certificateData.issuedAt), "MMM dd, yyyy") : 
                        'Not available'
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Institution & Blockchain</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Institution:</span>
                    <span className="font-medium">{certificateData.institutionName || 'Not available'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Student Address:</span>
                    <span className="font-medium font-mono text-sm">
                      {certificateData.studentAddress ? 
                        `${certificateData.studentAddress.slice(0, 6)}...${certificateData.studentAddress.slice(-4)}` : 
                        'Not available'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">IPFS Hash:</span>
                    <span className="font-medium font-mono text-sm">
                      {certificateData.ipfsHash ? 
                        `${certificateData.ipfsHash.slice(0, 10)}...` : 
                        'Not available'
                      }
                    </span>
                  </div>
                  {certificateData.tokenId && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Token ID:</span>
                      <span className="font-medium">#{certificateData.tokenId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Certificate Type:</span>
                    <span className="font-medium">{certificateData.certificateType || 'Not available'}</span>
                  </div>
                </div>
                
                                 <div className="pt-4">
                   <Button 
                     variant="outline" 
                     className="w-full"
                     onClick={() => certificateData.ipfsHash ? 
                       window.open(`https://ipfs.io/ipfs/${certificateData.ipfsHash}`, '_blank') : 
                       alert('IPFS hash not available')
                     }
                     disabled={!certificateData.ipfsHash}
                   >
                     <ExternalLink className="w-4 h-4 mr-2" />
                     View Certificate Document
                   </Button>
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}