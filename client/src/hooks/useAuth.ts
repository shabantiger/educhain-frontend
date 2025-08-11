import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { auth } from "@/lib/auth";
import { api } from "@/lib/api";

export function useAuth() {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(auth.isAuthenticated());

  // Update authentication state when token changes
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(auth.isAuthenticated());
    };

    // Check immediately
    checkAuth();

    // Listen for custom auth state change events
    const handleAuthStateChange = (event: CustomEvent) => {
      setIsAuthenticated(event.detail.isAuthenticated);
    };

    window.addEventListener('authStateChange', handleAuthStateChange as EventListener);
    
    // Also check when the component mounts and when the page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('authStateChange', handleAuthStateChange as EventListener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/institutions/profile"],
    queryFn: () => api.getProfile().then(res => res.institution),
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = () => {
    auth.logout();
    queryClient.clear();
    setIsAuthenticated(false);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
  };
}
