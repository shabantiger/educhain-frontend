import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Upload, AlertCircle, CheckCircle } from "lucide-react";
import { insertCertificateSchema, type InsertCertificate } from "@shared/schema";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface CreateCertificateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCertificateModal({ open, onOpenChange }: CreateCertificateModalProps) {
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertCertificate>({
    resolver: zodResolver(insertCertificateSchema),
    defaultValues: {
      studentAddress: "",
      studentName: "",
      courseName: "",
      grade: "",
      completionDate: "",
      certificateType: "Academic",
    },
  });

  const createCertificateMutation = useMutation({
    mutationFn: (formData: FormData) => api.issueCertificate(formData),
    onSuccess: (data) => {
      toast({
        title: "Certificate created successfully",
        description: "The certificate has been issued and saved. You can now mint it on the blockchain.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/certificates/institution"] });
      onOpenChange(false);
      form.reset();
      setCertificateFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Certificate creation failed",
        description: error.message || "Failed to create certificate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCertificate) => {
    if (!certificateFile) {
      toast({
        title: "File required",
        description: "Please upload a certificate file.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('certificateFile', certificateFile);
    formData.append('studentAddress', data.studentAddress);
    formData.append('studentName', data.studentName);
    formData.append('courseName', data.courseName);
    formData.append('grade', data.grade || '');
    formData.append('completionDate', data.completionDate || '');
    formData.append('certificateType', data.certificateType || 'Academic');

    createCertificateMutation.mutate(formData);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, JPEG, or PNG file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      setCertificateFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Certificate</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Student Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900">Student Information</h3>
              
              <FormField
                control={form.control}
                name="studentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Smith"
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
                name="studentAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Wallet Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0x742d35Cc6634C0532925a3b8D45d5b1E5b8a9C12"
                        {...field}
                        data-testid="input-student-address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Certificate Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900">Certificate Details</h3>
              
              <FormField
                control={form.control}
                name="courseName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course/Program Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Computer Science Degree"
                        {...field}
                        data-testid="input-course-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="A+, First Class, etc."
                          {...field}
                          data-testid="input-grade"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certificateType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificate Type</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-certificate-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Academic">Academic</SelectItem>
                            <SelectItem value="Professional">Professional</SelectItem>
                            <SelectItem value="Diploma">Diploma</SelectItem>
                            <SelectItem value="Certificate">Certificate</SelectItem>
                            <SelectItem value="Degree">Degree</SelectItem>
                          </SelectContent>
                        </Select>
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
                    <FormLabel>Completion Date (Optional)</FormLabel>
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
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900">Certificate File</h3>
              
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <h4 className="text-sm font-medium text-neutral-900 mb-1">Upload certificate file</h4>
                <p className="text-sm text-neutral-500 mb-4">PDF, JPEG, or PNG (max 10MB)</p>
                
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="certificate-file-upload"
                />
                <Label htmlFor="certificate-file-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" data-testid="button-upload-file">
                    Choose File
                  </Button>
                </Label>
                
                {certificateFile && (
                  <Alert className="mt-4 text-left">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>File selected:</strong> {certificateFile.name}
                      <br />
                      <span className="text-sm text-neutral-500">
                        Size: {(certificateFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                After creating the certificate, you'll need to mint it on the blockchain to make it verifiable by students and employers.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCertificateMutation.isPending || !certificateFile}
                className="flex-1"
                data-testid="button-create-certificate"
              >
                {createCertificateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Certificate
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
