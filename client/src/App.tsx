import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "@/pages/landing";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import InstitutionDashboard from "@/pages/institution/dashboard";
import Certificates from "@/pages/institution/certificates";
import Verification from "@/pages/institution/verification";
import SubscriptionPage from "@/pages/institution/subscription";
import StudentPortal from "@/pages/student/portal";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import NotFound from "@/pages/not-found";
import verify from "@/pages/employer/verify";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/student" component={StudentPortal} />
      <Route path="/verify" component= {verify} /> 
  
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      
      {/* Protected Institution Routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Layout>
            <InstitutionDashboard />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/certificates">
        <ProtectedRoute>
          <Layout>
            <Certificates />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/verification">
        <ProtectedRoute>
          <Layout>
            <Verification />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/subscription">
        <ProtectedRoute>
          <Layout>
            <SubscriptionPage />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <Analytics />
        <SpeedInsights />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
