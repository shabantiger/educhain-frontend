import { useQuery, useQueryClient } from "@tanstack/react-query";
import { auth } from "@/lib/auth";
import { api } from "@/lib/api";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/institutions/profile"],
    queryFn: () => api.getProfile().then(res => res.institution),
    enabled: auth.isAuthenticated(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = () => {
    auth.logout();
    queryClient.clear();
  };

  return {
    user,
    isLoading,
    isAuthenticated: auth.isAuthenticated(),
    logout,
  };
}
