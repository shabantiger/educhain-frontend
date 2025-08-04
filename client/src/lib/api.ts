import { auth, getAuthHeaders } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const text = await response.text();
    let errorMessage = response.statusText;
    
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    
    throw new ApiError(response.status, errorMessage);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text();
}

export const api = {
  // Auth endpoints
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE}/api/institutions/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  register: async (data: any) => {
    const response = await fetch(`${API_BASE}/api/institutions/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Institution endpoints
  getProfile: async () => {
    const authHeaders = getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/institutions/profile`, {
      headers: authHeaders,
    });
    return handleResponse(response);
  },

  getVerificationStatus: async () => {
    const authHeaders = getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/institutions/verification-status`, {
      headers: authHeaders,
    });
    return handleResponse(response);
  },

  uploadVerificationDocuments: async (formData: FormData) => {
    const authHeaders = getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/institutions/verification-documents`, {
      method: 'POST',
      headers: authHeaders,
      body: formData,
    });
    return handleResponse(response);
  },

  // Certificate endpoints
  issueCertificate: async (formData: FormData) => {
    const authHeaders = getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/certificates/issue`, {
      method: 'POST',
      headers: authHeaders,
      body: formData,
    });
    return handleResponse(response);
  },

  updateCertificateAfterMint: async (certificateId: string, data: { tokenId: number; walletAddress: string }) => {
    const authHeaders = getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/certificates/${certificateId}/mint`, {
      method: 'PATCH',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getCertificates: async () => {
    const authHeaders = getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/certificates/institution`, {
      headers: authHeaders,
    });
    return handleResponse(response);
  },

  // Subscription endpoints
  getSubscriptionPlans: async () => {
    const response = await fetch(`${API_BASE}/api/subscription/plans`);
    return handleResponse(response);
  },

  getCurrentSubscription: async () => {
    const authHeaders = getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/subscription/current`, {
      headers: authHeaders,
    });
    return handleResponse(response);
  },

  getUsage: async () => {
    const authHeaders = getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/subscription/usage`, {
      headers: authHeaders,
    });
    return handleResponse(response);
  },

  subscribe: async (data: { planId: string; paymentMethod: string }) => {
    const authHeaders = getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/subscription/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  cancelSubscription: async () => {
    const authHeaders = getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/subscription/cancel`, {
      method: 'POST',
      headers: authHeaders,
    });
    return handleResponse(response);
  },

  getPayments: async () => {
    const authHeaders = getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/subscription/payments`, {
      headers: authHeaders,
    });
    return handleResponse(response);
  },

  // Dashboard stats
  getStats: async () => {
    const authHeaders = getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/stats`, {
      headers: authHeaders,
    });
    return handleResponse(response);
  },

  // Student endpoints
  connectWallet: async (walletAddress: string) => {
    const response = await fetch(`${API_BASE}/api/students/connect-wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress }),
    });
    return handleResponse(response);
  },

  getCertificatesByWallet: async (walletAddress: string) => {
    const response = await fetch(`${API_BASE}/api/certificates/wallet/${walletAddress}`);
    return handleResponse(response);
  },

  verifyCertificate: async (id: string) => {
    const response = await fetch(`${API_BASE}/api/certificates/verify/${id}`);
    return handleResponse(response);
  },

  // Mint certificate to blockchain (student action)
  mintCertificateToBlockchain: async (certificateId: string, data: { tokenId: number; walletAddress: string; transactionHash: string }) => {
    const response = await fetch(`${API_BASE}/api/certificates/${certificateId}/mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};
