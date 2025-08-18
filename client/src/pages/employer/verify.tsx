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
  const [searchMethod, setSearchMethod] = useState<"ipfs" | "token">("ipfs");
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data: certificateData, isLoading, error, refetch } = useQuery({
    queryKey: ["certificate-verification", searchMethod, searchValue],
    queryFn: async () => {
      if (!searchValue.trim()) return null;
      
      if (searchMethod === "ipfs") {
        return await api.verifyCertificateByIPFS(searchValue);
      } else {
        return await api.verifyCertificateByToken(parseInt(searchValue));
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
    
    if (!certificate.isValid) {
      return { status: "revoked", icon: XCircle, color: "text-red-600", bg: "bg-red-100", text: "Certificate Revoked" };
    }
    if (certificate.isMinted) {
      return { status: "active", icon: CheckCircle, color: "text-green-600", bg: "bg-green-100", text: "Certificate Verified" };
    }
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
          <Tabs value={searchMethod} onValueChange={(value) => setSearchMethod(value as "ipfs" | "token")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ipfs" className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                IPFS Hash
              </TabsTrigger>
              <TabsTrigger value="token" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Token ID
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
              <p className="text-neutral-500">
                No certificate found with the provided {searchMethod === "ipfs" ? "IPFS hash" : "token ID"}.
              </p>
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
                      {format(new Date(certificateData.completionDate), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Issue Date:</span>
                    <span className="font-medium">
                      {format(new Date(certificateData.issuedAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Institution & Blockchain</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Institution:</span>
                    <span className="font-medium">{certificateData.institutionName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Student Address:</span>
                    <span className="font-medium font-mono text-sm">
                      {certificateData.studentAddress.slice(0, 6)}...{certificateData.studentAddress.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">IPFS Hash:</span>
                    <span className="font-medium font-mono text-sm">
                      {certificateData.ipfsHash.slice(0, 10)}...
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
                    <span className="font-medium">{certificateData.certificateType}</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`https://ipfs.io/ipfs/${certificateData.ipfsHash}`, '_blank')}
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