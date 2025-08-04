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
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
            Secure Educational
            <span className="gradient-bg bg-clip-text text-transparent"> Certificates</span>
            <br />
            on the Blockchain
          </h1>
          
          <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
            Issue, verify, and manage educational certificates with blockchain technology. 
            Ensure authenticity, prevent fraud, and provide instant verification for students and employers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="min-w-[200px]" data-testid="cta-register">
                Start Issuing Certificates
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/student">
              <Button size="lg" variant="outline" className="min-w-[200px]" data-testid="cta-verify">
                <Wallet className="mr-2 h-5 w-5" />
                Verify My Certificates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Why Choose EduChain?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Our blockchain-based solution provides unparalleled security, transparency, and trust for educational credentials.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Tamper-Proof Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  Blockchain technology ensures certificates cannot be forged, altered, or duplicated, providing ultimate security.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Instant Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  Verify certificates instantly with a simple scan or click. No waiting, no paperwork, no delays.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Global Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  Certificates are recognized worldwide, accessible anywhere, and accepted by employers and institutions globally.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle>Easy Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  Intuitive dashboard for institutions to issue, track, and manage certificates with comprehensive analytics.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Digital Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  Students can access all their certificates in one secure digital wallet, shareable with employers instantly.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Privacy Protected</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  Advanced encryption and privacy controls ensure sensitive information is protected while maintaining transparency.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/security">Security</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-900 mb-4">Support</h4>
              <ul className="space-y-2 text-neutral-600">
                <li><Link href="/docs">Documentation</Link></li>
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-900 mb-4">Company</h4>
              <ul className="space-y-2 text-neutral-600">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/careers">Careers</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 mt-8 pt-8 text-center text-neutral-600">
            <p>&copy; 2024 EduChain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
