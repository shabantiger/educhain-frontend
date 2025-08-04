import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  LayoutDashboard, 
  FileText, 
  Shield, 
  CreditCard,
  LogOut,
  User,
  Wallet
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import StudentPortalModal from "@/components/StudentPortalModal";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Certificates", href: "/certificates", icon: FileText },
  { name: "Verification", href: "/verification", icon: Shield },
  { name: "Subscription", href: "/subscription", icon: CreditCard },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isStudentPortalOpen, setIsStudentPortalOpen] = useState(false);

  const isActive = (href: string) => location === href;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Link href="/dashboard">
                  <h1 className="text-2xl font-bold text-neutral-900" data-testid="logo">
                    EduChain
                  </h1>
                  <span className="text-xs text-neutral-500">Blockchain Certificates</span>
                </Link>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <button
                    className={`${
                      isActive(item.href)
                        ? "text-primary border-b-2 border-primary font-medium"
                        : "text-neutral-600 hover:text-neutral-900"
                    } transition-colors`}
                    data-testid={`nav-${item.name.toLowerCase()}`}
                  >
                    {item.name}
                  </button>
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsStudentPortalOpen(true)}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                data-testid="student-portal-btn"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Student Portal
              </Button>

              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right text-sm">
                  <div className="font-medium text-neutral-900" data-testid="institution-name">
                    {user?.name}
                  </div>
                  <div className="text-neutral-500">
                    {user?.isVerified ? "Verified Institution" : "Pending Verification"}
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user?.name?.charAt(0) || "I"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col space-y-4 mt-4">
                    {navigation.map((item) => (
                      <Link key={item.name} href={item.href}>
                        <button
                          className={`flex items-center space-x-2 w-full p-2 rounded-lg text-left ${
                            isActive(item.href)
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-neutral-100"
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </button>
                      </Link>
                    ))}
                    
                    <Button
                      onClick={logout}
                      variant="ghost"
                      className="justify-start"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Student Portal Modal */}
      <StudentPortalModal 
        open={isStudentPortalOpen} 
        onOpenChange={setIsStudentPortalOpen} 
      />
    </div>
  );
}
