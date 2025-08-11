# EduChain Frontend Setup Guide

This guide will help you set up the frontend to communicate with your backend and smart contract.

## Environment Configuration

1. **Copy the environment file:**
   ```bash
   cp env.example .env
   ```

2. **Update the environment variables in `.env`:**
   ```env
   # Backend Configuration
   VITE_API_URL=https://educhain-backend-avmj.onrender.com
   
   # Smart Contract Configuration
   VITE_CONTRACT_ADDRESS=0xBD4228241dc6BC14C027bF8B6A24f97bc9872068
   VITE_ETHEREUM_RPC_URL=https://ethereum-mainnet.s.alchemy.com/v2/demo
   
   # Contract ABI (already included in env.example)
   VITE_CONTRACT_ABI=[...]
   ```

## Key Features Implemented

### 1. Certificate Issuance
- **Institutions** can issue certificates through the backend
- **Optional blockchain minting** when student wallet address is provided
- **Batch issuance** support for multiple certificates
- **IPFS integration** for certificate storage

### 2. Certificate Verification
- **Dual verification**: Backend + Blockchain
- **IPFS hash verification** for blockchain-only certificates
- **Certificate ID verification** for backend certificates
- **Real-time validation** status

### 3. Wallet Integration
- **MetaMask connection** for institutions and students
- **Student wallet linking** to certificates
- **Certificate ownership** tracking on blockchain

### 4. Institution Management
- **Institution registration** on blockchain
- **Profile management** and updates
- **Statistics tracking** from both backend and blockchain

## Usage Examples

### For Institutions

```typescript
import { useCertificate } from '@/hooks/useCertificate';

function IssueCertificateForm() {
  const { issueCertificate, isIssuing } = useCertificate();

  const handleSubmit = async (formData) => {
    const request = {
      studentName: formData.studentName,
      studentEmail: formData.studentEmail,
      studentWalletAddress: formData.walletAddress, // Optional
      courseName: formData.courseName,
      grade: formData.grade,
      completionDate: formData.completionDate,
      certificateType: formData.certificateType,
      certificateFile: formData.file
    };

    await issueCertificate.mutateAsync(request);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <button type="submit" disabled={isIssuing}>
        {isIssuing ? 'Issuing...' : 'Issue Certificate'}
      </button>
    </form>
  );
}
```

### For Students

```typescript
import { useWalletCertificates } from '@/hooks/useCertificate';

function StudentDashboard({ walletAddress }) {
  const { certificates, isLoading, connectWallet } = useWalletCertificates(walletAddress);

  return (
    <div>
      <h2>My Certificates</h2>
      {isLoading ? (
        <p>Loading certificates...</p>
      ) : (
        certificates.map(cert => (
          <div key={cert.certificateId || cert.tokenId}>
            <h3>{cert.blockchainData?.courseName || cert.backendData?.courseName}</h3>
            <p>Status: {cert.isValid ? 'Valid' : 'Invalid'}</p>
            <p>Source: {cert.verificationSource}</p>
          </div>
        ))
      )}
    </div>
  );
}
```

### Certificate Verification

```typescript
import { useCertificateVerification } from '@/hooks/useCertificate';

function CertificateVerifier() {
  const { verificationResult, isVerifying, verifyById, verifyByIPFS } = useCertificateVerification();

  const handleVerifyById = async (certificateId: string) => {
    await verifyById(certificateId);
  };

  const handleVerifyByIPFS = async (ipfsHash: string) => {
    await verifyByIPFS(ipfsHash);
  };

  return (
    <div>
      {/* Verification forms */}
      {verificationResult && (
        <div>
          <h3>Verification Result</h3>
          <p>Valid: {verificationResult.isValid ? 'Yes' : 'No'}</p>
          <p>Source: {verificationResult.verificationSource}</p>
          {/* Display certificate details */}
        </div>
      )}
    </div>
  );
}
```

## Backend Integration

The frontend is configured to work with your backend at `https://educhain-backend-avmj.onrender.com`. The following endpoints are expected:

### Required Backend Endpoints

1. **Certificate Issuance**
   - `POST /api/certificates/issue` - Issue a new certificate
   - `PATCH /api/certificates/{id}/mint` - Update certificate with blockchain data

2. **Certificate Verification**
   - `GET /api/certificates/verify/{id}` - Verify certificate by ID
   - `GET /api/certificates/wallet/{address}` - Get certificates by wallet

3. **Institution Management**
   - `GET /api/institutions/profile` - Get institution profile
   - `GET /api/stats` - Get institution statistics

4. **Student Management**
   - `POST /api/students/connect-wallet` - Connect student wallet

## Smart Contract Integration

The frontend integrates with your smart contract at `0xBD4228241dc6BC14C027bF8B6A24f97bc9872068` and supports:

- Certificate issuance and minting
- Certificate verification by token ID and IPFS hash
- Institution registration and management
- Student certificate tracking
- Certificate revocation

## Running the Application

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Troubleshooting

### Common Issues

1. **MetaMask not connecting:**
   - Ensure MetaMask is installed and unlocked
   - Check if you're on the correct network
   - Try refreshing the page

2. **Backend connection errors:**
   - Verify the `VITE_API_URL` is correct
   - Check if your backend is running and accessible
   - Ensure CORS is properly configured on your backend

3. **Smart contract errors:**
   - Verify the contract address is correct
   - Ensure you're on the correct network (Ethereum mainnet)
   - Check if the contract ABI is properly formatted

4. **Certificate verification fails:**
   - Check if the certificate exists in both backend and blockchain
   - Verify the IPFS hash is correct
   - Ensure the certificate hasn't been revoked

### Environment Variables Checklist

- [ ] `VITE_API_URL` points to your backend
- [ ] `VITE_CONTRACT_ADDRESS` is your deployed contract address
- [ ] `VITE_ETHEREUM_RPC_URL` is a valid RPC endpoint
- [ ] `VITE_CONTRACT_ABI` contains the complete contract ABI

## Next Steps

1. **Test the integration** with your backend
2. **Deploy the frontend** to your preferred hosting platform
3. **Configure production environment** variables
4. **Set up monitoring** for certificate operations
5. **Implement additional features** as needed

For support or questions, refer to the code comments and TypeScript interfaces for detailed information about each function and component.
