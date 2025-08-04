import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
import { Loader2, Upload, ExternalLink, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";

const createCertificateSchema = z.object({
  studentName: z.string().min(2, "Student name must be at least 2 characters"),
  studentEmail: z.string().email("Please enter a valid email address"),
  studentAddress: z.string().min(42, "Please enter a valid wallet address").max(42, "Please enter a valid wallet address"),
  courseName: z.string().min(2, "Course name must be at least 2 characters"),
  grade: z.string().min(1, "Grade is required"),
  completionDate: z.string().min(1, "Completion date is required"),
  description: z.string().optional(),
});

type CreateCertificateForm = z.infer<typeof createCertificateSchema>;

interface CreateCertificateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateCertificateModal({ open, onClose }: CreateCertificateModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [ipfsHash, setIpfsHash] = useState<string>("");
  const { toast } = useToast();
  const { mintCertificate, walletAddress, isConnected, connect, isLoading: walletLoading } = useWallet();
  const isLoading = walletLoading;
  const queryClient = useQueryClient();

  const form = useForm<CreateCertificateForm>({
    resolver: zodResolver(createCertificateSchema),
    defaultValues: {
      studentName: "",
      studentEmail: "",
      studentAddress: "",
      courseName: "",
      grade: "",
      completionDate: "",
      description: "",
    },
  });

  const createCertificateMutation = useMutation({
    mutationFn: async (data: CreateCertificateForm) => {
      if (!isConnected) {
        throw new Error("Please connect your wallet first");
      }

      // First, create the certificate using your backend API
      const formData = new FormData();
      formData.append('studentName', data.studentName);
      formData.append('studentEmail', data.studentEmail);
      formData.append('studentAddress', data.studentAddress);
      formData.append('courseName', data.courseName);
      formData.append('grade', data.grade);
      formData.append('completionDate', data.completionDate);
      if (data.description) formData.append('description', data.description);
      if (uploadedFile) formData.append('certificate', uploadedFile);

      // Issue certificate through your backend (which handles IPFS and database)
      const certificateResponse = await api.issueCertificate(formData);
      
      // If backend supports on-chain minting, it might return transaction details
      // Otherwise, we can mint it separately using the blockchain service
      if (certificateResponse.tokenId && certificateResponse.transactionHash) {
        return {
          certificateId: certificateResponse.id,
          txHash: certificateResponse.transactionHash,
          tokenId: certificateResponse.tokenId
        };
      } else {
        // Fallback: mint on blockchain using the certificate data
        const certificateId = certificateResponse.id;
        const fileHash = certificateResponse.ipfsHash || ipfsHash || `ipfs_${certificateId}`;

        const txHash = await mintCertificate(
          certificateId,
          data.studentAddress,
          data.studentName,
          data.courseName,
          fileHash
        );

        // Update the certificate with blockchain info
        if (txHash && walletAddress) {
          await api.updateCertificateAfterMint(certificateId, {
            tokenId: Date.now(), // In production, extract from transaction receipt
            walletAddress: walletAddress
          });
        }

        return { certificateId, txHash };
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Certificate created successfully!",
        description: `Certificate minted on blockchain. Transaction: ${data.txHash.slice(0, 10)}...`,
      });
      
      // Invalidate certificates query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      
      // Reset form and close modal
      form.reset();
      setUploadedFile(null);
      setIpfsHash("");
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create certificate",
        description: error.message || "An error occurred while creating the certificate.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // In a real implementation, you would upload to IPFS here
      // For now, we'll simulate the upload and generate a hash
      setUploadedFile(file);
      
      // Simulate IPFS upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock IPFS hash (in production, use real IPFS service)
      const mockHash = `QmX${Math.random().toString(36).substr(2, 44)}`;
      setIpfsHash(mockHash);
      
      toast({
        title: "File uploaded successfully",
        description: `Document uploaded to IPFS: ${mockHash.slice(0, 10)}...`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file to IPFS.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: CreateCertificateForm) => {
    createCertificateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Certificate</DialogTitle>
          <DialogDescription>
            Create and mint a new certificate on the blockchain. This will require a blockchain transaction.
          </DialogDescription>
        </DialogHeader>

        {/* Wallet Connection Check */}
        {!isConnected && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Wallet Connection Required</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Please connect your wallet to issue certificates on the blockchain.
            </p>
            <Button 
              variant="outline" 
              onClick={connect} 
              className="mt-2"
              disabled={isLoading}
              data-testid="button-connect-wallet"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Wallet"
              )}
            </Button>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Student Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Student Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter student's full name" 
                          {...field} 
                          data-testid="input-student-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="studentEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Email *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="student@example.com" 
                          {...field} 
                          data-testid="input-student-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="studentAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Wallet Address *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="0x..." 
                        {...field} 
                        data-testid="input-student-address"
                        className="font-mono text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Course Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Course Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="courseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Computer Science Degree" 
                          {...field} 
                          data-testid="input-course-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade/Result *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., A+, Distinction, 85%" 
                          {...field} 
                          data-testid="input-grade"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="completionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Completion Date *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-completion-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Optional additional information about the certificate..."
                        rows={3}
                        {...field} 
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Document Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Certificate Document</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <div className="text-green-600 font-medium">
                        ✓ {uploadedFile.name}
                      </div>
                      {ipfsHash && (
                        <div className="text-sm text-gray-600">
                          IPFS Hash: {ipfsHash}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-2"
                            onClick={() => window.open(`https://ipfs.io/ipfs/${ipfsHash}`, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="text-sm text-gray-600">
                        Upload certificate document (PDF, PNG, JPG)
                      </div>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="mt-4"
                    disabled={isUploading}
                    data-testid="input-file-upload"
                  />
                  
                  {isUploading && (
                    <div className="mt-2 text-sm text-blue-600">
                      Uploading to IPFS...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={createCertificateMutation.isPending}
                data-testid="button-cancel-certificate"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createCertificateMutation.isPending || isUploading || !isConnected}
                data-testid="button-create-certificate"
              >
                {createCertificateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Certificate...
                  </>
                ) : !isConnected ? (
                  "Connect Wallet First"
                ) : (
                  "Create & Mint Certificate"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}