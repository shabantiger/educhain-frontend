const API_BASE = (import.meta.env.VITE_API_BASE ?? "https://educhain-backend-avmj.onrender.com").replace(/\/$/, "");
console.log("Using API base:", API_BASE);
import { auth, getAuthHeaders } from './auth';



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
      errorMessage = errorData.error || errorData.message || errorData.details || errorMessage;
    } catch {
      // If response is HTML (like error page), extract meaningful error
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        errorMessage = `Server error (${response.status}): ${response.statusText}`;
      } else {
        errorMessage = text || errorMessage;
      }
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
  // Health check
  healthCheck: async () => {
    const response = await fetch(`${API_BASE}/api/health`);
    return handleResponse(response);
  },

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
    const data = await handleResponse(response);
    // Normalize response shape
    const list = Array.isArray(data)
      ? data
      : Array.isArray((data as any)?.certificates)
      ? (data as any).certificates
      : Array.isArray((data as any)?.data)
      ? (data as any).data
      : [];

    const certificates = list.map((c: any) => ({
      id: c.id ?? c._id ?? c.uuid ?? String(c.tokenId ?? c._id ?? Math.random()),
      studentAddress: c.studentAddress,
      studentName: c.studentName,
      courseName: c.courseName,
      grade: c.grade,
      ipfsHash: c.ipfsHash,
      completionDate: c.completionDate,
      certificateType: c.certificateType ?? 'Academic',
      issuedBy: c.issuedBy?._id ?? c.issuedBy ?? '',
      institutionName: c.institutionName,
      issuedAt: c.issuedAt ?? c.createdAt ?? c.issueDate,
      isValid: c.isValid ?? true,
      isMinted: c.isMinted ?? Boolean(c.tokenId),
      tokenId: c.tokenId,
      mintedTo: c.mintedTo,
      mintedAt: c.mintedAt,
    }));

    return { certificates } as any;
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

  // Mint certificate to blockchain (student action)
  mintCertificateToBlockchain: async (certificateId: string, data: { tokenId: number; walletAddress: string; transactionHash: string }) => {
    const response = await fetch(`${API_BASE}/api/certificates/${certificateId}/mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Verification endpoints
  verifyCertificateByIPFS: async (ipfsHash: string) => {
    const response = await fetch(`${API_BASE}/api/certificates/verify/ipfs/${ipfsHash}`);
    return handleResponse(response);
  },

  verifyCertificateByToken: async (tokenId: number) => {
    const response = await fetch(`${API_BASE}/api/certificates/verify/token/${tokenId}`);
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
    const data = await handleResponse(response);
    
    // Normalize response shape for student certificates
    const list = Array.isArray(data)
      ? data
      : Array.isArray((data as any)?.certificates)
      ? (data as any).certificates
      : Array.isArray((data as any)?.data)
      ? (data as any).data
      : [];

    const certificates = list.map((c: any) => ({
      id: c.id ?? c._id ?? c.uuid ?? String(c.tokenId ?? c._id ?? Math.random()),
      studentAddress: c.studentAddress,
      studentName: c.studentName,
      courseName: c.courseName,
      grade: c.grade,
      ipfsHash: c.ipfsHash,
      completionDate: c.completionDate,
      certificateType: c.certificateType ?? 'Academic',
      issuedBy: c.issuedBy?._id ?? c.issuedBy ?? '',
      institutionName: c.institutionName,
      issuedAt: c.issuedAt ?? c.createdAt ?? c.issueDate,
      isValid: c.isValid ?? true,
      isMinted: c.isMinted ?? Boolean(c.tokenId),
      tokenId: c.tokenId,
      mintedTo: c.mintedTo,
      mintedAt: c.mintedAt,
    }));

    return { certificates } as any;
  },

  verifyCertificate: async (id: string) => {
    const response = await fetch(`${API_BASE}/api/certificates/verify/${id}`);
    return handleResponse(response);
  },

  // Blockchain integration endpoints
  getBlockchainStatus: async (institutionId: string) => {
    const authHeaders = getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/institutions/${institutionId}/blockchain-status`, {
      headers: authHeaders,
    });
    return handleResponse(response);
  },

  // Admin blockchain endpoints
  getBlockchainSummary: async () => {
    const response = await fetch(`${API_BASE}/api/admin/blockchain-summary`, {
      headers: { 'admin-email': 'admin@educhain.com' },
    });
    return handleResponse(response);
  },

  getBlockchainStatusAll: async () => {
    const response = await fetch(`${API_BASE}/api/admin/blockchain-status`, {
      headers: { 'admin-email': 'admin@educhain.com' },
    });
    return handleResponse(response);
  },

  registerInstitutionOnBlockchain: async (institutionId: string) => {
    const response = await fetch(`${API_BASE}/api/admin/institutions/${institutionId}/blockchain-register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'admin-email': 'admin@educhain.com' 
      },
    });
    return handleResponse(response);
  },

  authorizeInstitutionOnBlockchain: async (institutionId: string) => {
    const response = await fetch(`${API_BASE}/api/admin/institutions/${institutionId}/blockchain-authorize`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'admin-email': 'admin@educhain.com' 
      },
    });
    return handleResponse(response);
  },

  bulkRegisterInstitutionsOnBlockchain: async () => {
    const response = await fetch(`${API_BASE}/api/admin/blockchain-register-all`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'admin-email': 'admin@educhain.com' 
      },
    });
    return handleResponse(response);
  },
};
