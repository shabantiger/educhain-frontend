import VerificationSection from '../components/VerificationSection';
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Award, 
  Zap, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Wallet,
  FileText,
  Lock
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-neutral-900" data-testid="logo">
                EduChain
              </h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Blockchain Certificates
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" data-testid="login-btn">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button data-testid="register-btn">
                  Get Started
                </Button>
              </Link>
              <Link href="/student">
                <Button variant="outline" data-testid="student-portal-btn">
                  <Wallet className="w-4 h-4 mr-2" />
                  Student Portal
                </Button>
              </Link>
              <Link href="/verify">
                <Button variant="secondary" data-testid="verify-btn">
                  <Wallet className="w-4 h-4 mr-2" />
                  Verify Here
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          {/* Left: Logo Section */}
          <div className="w-full md:w-1/3 flex justify-center md:justify-start items-center mb-8 md:mb-0">
            <div className="flex items-center justify-center md:justify-start">
              <img
                src="/images/logo.png"
                alt="EduChain Logo"
                className="h-24 sm:h-32 md:h-40 lg:h-48 object-contain drop-shadow-lg"
                style={{ maxWidth: "100%" }}
              />
            </div>
          </div>
          
          {/* Right: Text Content */}
          <div className="w-full md:w-2/3 text-center md:text-left md:pl-12">
            <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
              Secure Educational
              <span className="gradient-bg bg-clip-text text-transparent"> Certificates</span>
              <br />
              on the Blockchain
            </h1>
            
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto md:mx-0">
              Issue, verify, and manage educational certificates with blockchain technology. 
              Ensure authenticity, prevent fraud, and provide instant verification for students and employers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/register">
                <Button size="lg" className="min-w-[200px]" data-testid="cta-register">
                  Start Issuing Certificates
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/verify">
                <Button size="lg" variant="outline" className="min-w-[200px]" data-testid="cta-verify">
                  <Wallet className="mr-2 h-5 w-5" />
                  Verify My Certificates
                </Button>
              </Link>
            </div>
          </div>
          
        </div>
      </section>

     <VerificationSection />
 {/* Image Section */}
 <div className="flex justify-left mb-8" style={{ marginLeft: '2in',  }}>
   <img 
     src="/images/Picture1.png" 
     alt="Student holding an EduChain certificate" 
     className="w-[400px] h-[720px] object-cover rounded-lg shadow-lg"
     style={{ marginTop: '0.5in', marginBottom: '0.5in', marginRight: '24px' }}
   />
   <img 
     src="/images/Picture3.png" 
     alt="Student holding an EduChain certificate" 
     className="w-[1024px] h-[720px] object-cover rounded-lg shadow-lg"
     style={{ marginTop: '0.5in', marginBottom: '0.5in', marginRight: '24px' }}
   />
   <img 
     src="/images/Picture2.png" 
     alt="A certificate in wallet" 
     className="w-[400px] h-[720px] object-cover rounded-lg shadow-lg"
     style={{ marginTop: '0.5in', marginBottom: '0.5in' }}
   />
 </div>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Simple, secure, and efficient certificate management in three easy steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                Institution Registration
              </h3>
              <p className="text-neutral-600">
                Educational institutions register and get verified on our platform with secure credentials and documentation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-secondary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                Certificate Issuance
              </h3>
              <p className="text-neutral-600">
                Verified institutions issue certificates directly to students' blockchain wallets with all relevant details.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-accent-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                Instant Verification
              </h3>
              <p className="text-neutral-600">
                Students and employers can instantly verify certificates using our platform or blockchain explorers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Revolutionize Educational Certificates?
          </h2>
          <p className="text-xl text-neutral-300 mb-8">
            Join thousands of institutions already using EduChain to issue secure, verifiable certificates.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="min-w-[200px] bg-primary hover:bg-primary/90">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="min-w-[200px] border-white text-white hover:bg-white hover:text-neutral-900">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-neutral-900 mb-4">EduChain</h3>
              <p className="text-neutral-600 mb-4">
                Secure, verifiable educational certificates on the blockchain.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-900 mb-4">Product</h4>
              <ul className="space-y-2 text-neutral-600">
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/subscription">Pricing</Link></li>
                <li><Link href="/security">Security</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-900 mb-4">Support</h4>
              <ul className="space-y-2 text-neutral-600">
                <li><Link href="/documentation">Documentation</Link></li>
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-900 mb-4">Company</h4>
              <ul className="space-y-2 text-neutral-600">
                <li><Link href="/roadmap">Roadmap</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/careers">Careers</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 mt-8 pt-8 text-center text-neutral-600">
            <p>&copy; 2025 EduChain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
