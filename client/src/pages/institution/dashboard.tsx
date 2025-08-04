import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Award, 
  Users, 
  Zap, 
  DollarSign,
  Plus,
  Eye,
  Upload,
  BarChart3,
  CheckCircle,
  UserPlus,
  Activity
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import CreateCertificateModal from "@/components/CreateCertificateModal";
import { useLocation } from "wouter";

export default function InstitutionDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    enabled: !!user,
  });

  const { data: subscription } = useQuery({
    queryKey: ["/api/subscription/current"],
    enabled: !!user,
  });

  const quickActions = [
    {
      title: "Issue Certificate",
      description: "Create new certificate",
      icon: Plus,
      color: "text-primary",
      bg: "bg-primary/10",
      action: () => setIsCertificateModalOpen(true),
    },
    {
      title: "View Students",
      description: "Manage student records",
      icon: Users,
      color: "text-secondary",
      bg: "bg-secondary/10",
      action: () => setLocation("/certificates"),
    },
    {
      title: "Upload Documents",
      description: "Verification documents",
      icon: Upload,
      color: "text-accent",
      bg: "bg-accent/10",
      action: () => setLocation("/verification"),
    },
    {
      title: "View Analytics",
      description: "Platform insights",
      icon: BarChart3,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      action: () => setLocation("/subscription"),
    },
  ];

  const recentActivities = [
    {
      type: "certificate",
      message: "Certificate issued to John Smith",
      details: "Computer Science Degree - 2 hours ago",
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      type: "student",
      message: "New student registered",
      details: "Sarah Johnson - 5 hours ago",
      icon: UserPlus,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      type: "blockchain",
      message: "Blockchain transaction confirmed",
      details: "Certificate hash: 0x4a5b...c9d2 - 1 day ago",
      icon: Activity,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900" data-testid="page-title">
            Dashboard
          </h1>
          <p className="text-neutral-600">
            Welcome back, {user?.name}
          </p>
        </div>
        
        {!user?.isVerified && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Verification Pending
          </Badge>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-neutral-500 text-sm">Certificates Issued</p>
                    <p className="text-2xl font-semibold text-neutral-900" data-testid="stat-certificates">
                      {stats?.totalCertificates || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-secondary/10">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-neutral-500 text-sm">Active Certificates</p>
                    <p className="text-2xl font-semibold text-neutral-900" data-testid="stat-active">
                      {stats?.activeCertificates || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-accent/10">
                    <Zap className="w-6 h-6 text-accent" />
                  </div>
                  <div className="ml-4">
                    <p className="text-neutral-500 text-sm">Blockchain Transactions</p>
                    <p className="text-2xl font-semibold text-neutral-900" data-testid="stat-transactions">
                      {stats?.activeCertificates || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-neutral-500 text-sm">Monthly Usage</p>
                    <p className="text-2xl font-semibold text-neutral-900" data-testid="stat-usage">
                      {subscription?.usage?.certificatesThisMonth || 0}/
                      {subscription?.subscription?.planId === 'enterprise' ? '∞' : '500'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="outline"
                onClick={action.action}
                className="h-auto p-4 flex-col items-start space-y-2"
                data-testid={`action-${action.title.toLowerCase().replace(' ', '-')}`}
              >
                <div className={`p-2 rounded-lg ${action.bg} w-fit`}>
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <div className="text-left">
                  <div className="font-medium text-neutral-900">{action.title}</div>
                  <div className="text-sm text-neutral-500">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-neutral-50">
                <div className={`p-2 rounded-full ${activity.bg}`}>
                  <activity.icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{activity.message}</p>
                  <p className="text-sm text-neutral-500">{activity.details}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Certificate Modal */}
      <CreateCertificateModal
        open={isCertificateModalOpen}
        onOpenChange={setIsCertificateModalOpen}
      />
    </div>
  );
}
