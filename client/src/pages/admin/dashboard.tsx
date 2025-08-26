import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Users, 
  DollarSign, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  LogOut,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BlockchainManagement from "@/components/BlockchainManagement";

interface VerificationRequest {
  id: string;
  verificationRequestId: string;
  institutionId: string;
  institutionName: string;
  institutionEmail: string;
  registrationNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  comments?: string;
  documents: Array<{
    type: string;
    description: string;
    url: string;
    originalName?: string;
  }>;
}

interface RevenueData {
  totalRevenue: number;
  activeSubscriptions: number;
  planBreakdown: Record<string, number>;
}

const reviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  comments: z.string().optional(),
});

type ReviewForm = z.infer<typeof reviewSchema>;

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'blockchain'>('overview');
  const { toast } = useToast();

  const form = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      status: 'approved',
      comments: '',
    },
  });

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      setLocation('/admin/login');
      return;
    }
    fetchAdminData();
  }, [setLocation]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://educhain-backend-avmj.onrender.com';
      
      // First, test the connection
      try {
        const healthResponse = await fetch(`${API_BASE}/api/health`);
        if (!healthResponse.ok) {
          throw new Error(`Backend health check failed: ${healthResponse.status}`);
        }
        console.log('Backend connection successful');
      } catch (healthError) {
        console.error('Backend connection failed:', healthError);
        toast({
          title: "Connection Error",
          description: "Cannot connect to backend. Please check if the backend is running.",
          variant: "destructive",
        });
        return;
      }
      
      const [verificationResponse, revenueResponse] = await Promise.all([
        fetch(`${API_BASE}/api/admin/verification-requests`, {
          headers: { 'admin-email': 'admin@educhain.com' }
        }).catch(() => new Response('{"error": "Request failed"}', { status: 500 })),
        fetch(`${API_BASE}/api/admin/revenue`, {
          headers: { 'admin-email': 'admin@educhain.com' }
        }).catch(() => new Response('{"error": "Request failed"}', { status: 500 }))
      ]);

      console.log('Verification response status:', verificationResponse.status);
      console.log('Verification response URL:', verificationResponse.url);
      
             // Clone the response to avoid "body stream already read" error
       const verificationResponseClone = verificationResponse.clone();
       
       if (verificationResponse.ok) {
         try {
           const verificationData = await verificationResponse.json();
           setVerificationRequests(verificationData.verificationRequests || []);
         } catch (error) {
           console.error('Failed to parse verification response:', error);
           // Log the actual response text to see what we're getting
           const responseText = await verificationResponseClone.text();
           console.error('Response text:', responseText.substring(0, 200) + '...');
           setVerificationRequests([]);
         }
       } else {
         console.error('Verification request failed:', verificationResponse.status, verificationResponse.statusText);
         // Log the actual response text to see what we're getting
         const responseText = await verificationResponseClone.text();
         console.error('Response text:', responseText.substring(0, 200) + '...');
         setVerificationRequests([]);
       }

      console.log('Revenue response status:', revenueResponse.status);
      console.log('Revenue response URL:', revenueResponse.url);
      
             // Clone the response to avoid "body stream already read" error
       const revenueResponseClone = revenueResponse.clone();
       
       if (revenueResponse.ok) {
         try {
           const revenueData = await revenueResponse.json();
           setRevenueData(revenueData);
         } catch (error) {
           console.error('Failed to parse revenue response:', error);
           // Log the actual response text to see what we're getting
           const responseText = await revenueResponseClone.text();
           console.error('Response text:', responseText.substring(0, 200) + '...');
           setRevenueData(null);
         }
       } else {
         console.error('Revenue request failed:', revenueResponse.status, revenueResponse.statusText);
         // Log the actual response text to see what we're getting
         const responseText = await revenueResponseClone.text();
         console.error('Response text:', responseText.substring(0, 200) + '...');
         setRevenueData(null);
       }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data. Please check your backend connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (data: ReviewForm) => {
    if (!selectedRequest) return;
    
    setIsSubmitting(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://educhain-backend-avmj.onrender.com';
      
      const response = await fetch(`${API_BASE}/api/admin/verification-requests/${selectedRequest.verificationRequestId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin-email': 'admin@educhain.com'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Review failed');

      setReviewModal(false);
      setSelectedRequest(null);
      form.reset();
      
      // Refresh data
      await fetchAdminData();
      
      toast({
        title: "Success",
        description: "Verification request reviewed successfully!",
      });
    } catch (error) {
      console.error('Review error:', error);
      toast({
        title: "Error",
        description: "Failed to review request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReviewModal = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setReviewModal(true);
    form.reset({
      status: 'approved',
      comments: ''
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminEmail');
    setLocation('/admin/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <Button variant="outline" onClick={handleLogout} data-testid="button-admin-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
            size="sm"
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'blockchain' ? 'default' : 'outline'}
            onClick={() => setActiveTab('blockchain')}
            size="sm"
          >
            Blockchain Management
          </Button>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Revenue Analytics */}
        {revenueData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${revenueData.totalRevenue?.toFixed(2) || '0.00'}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{revenueData.activeSubscriptions || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verification Requests</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{verificationRequests.length}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Verification Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Verification Requests
              <Badge variant="secondary">{verificationRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {verificationRequests.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No verification requests found. Check your backend connection or wait for institutions to submit requests.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {/* Stats Summary */}
                <div className="flex gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span className="text-sm">Pending: {verificationRequests.filter(r => r.status === 'pending').length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Approved: {verificationRequests.filter(r => r.status === 'approved').length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Rejected: {verificationRequests.filter(r => r.status === 'rejected').length}</span>
                  </div>
                </div>

                {/* Requests List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {verificationRequests.map((request) => (
                    <Card key={request.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{request.institutionName}</CardTitle>
                            <p className="text-sm text-muted-foreground">{request.institutionEmail}</p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm">
                          <p><strong>Registration:</strong> {request.registrationNumber}</p>
                          <p><strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleDateString()}</p>
                        </div>
                        
                        {request.documents && request.documents.length > 0 && (
                          <div>
                            <p className="font-medium text-sm mb-2">Documents:</p>
                            <div className="space-y-1">
                              {request.documents.map((doc, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <FileCheck className="w-3 h-3" />
                                  <a 
                                    href={doc.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    {doc.description || doc.originalName}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {request.reviewedAt && (
                          <div className="text-sm bg-gray-50 p-3 rounded">
                            <p><strong>Reviewed:</strong> {new Date(request.reviewedAt).toLocaleDateString()}</p>
                            <p><strong>By:</strong> {request.reviewedBy}</p>
                            {request.comments && <p><strong>Comments:</strong> {request.comments}</p>}
                          </div>
                        )}

                        {request.status === 'pending' && (
                          <Button 
                            onClick={() => openReviewModal(request)}
                            className="w-full"
                            data-testid={`button-review-${request.id}`}
                          >
                            Review Request
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Modal */}
        <Dialog open={reviewModal} onOpenChange={setReviewModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Review Verification Request</DialogTitle>
              <DialogDescription>
                Review the verification request for {selectedRequest?.institutionName}
              </DialogDescription>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium">{selectedRequest.institutionName}</h4>
                  <p className="text-sm text-muted-foreground">{selectedRequest.institutionEmail}</p>
                  <p className="text-sm">Registration: {selectedRequest.registrationNumber}</p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleReview)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Decision</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select decision" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="approved">Approve</SelectItem>
                              <SelectItem value="rejected">Reject</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="comments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comments (optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Add review comments..."
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setReviewModal(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        data-testid="button-submit-review"
                      >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Processing...' : 'Submit Review'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            )}
          </DialogContent>
        </Dialog>
          </>
        )}

        {activeTab === 'blockchain' && (
          <BlockchainManagement />
        )}
      </div>
    </div>
  );
}