import { Link } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User } from "@shared/schema";
import { X } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
}

export default function MobileMenu({ isOpen, onClose, user, onLogout }: MobileMenuProps) {
  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key to close menu
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#features", label: "About" },
  ];

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex-col bg-white dark:bg-slate-900 transition-transform duration-300",
        isOpen ? "flex" : "hidden"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
            <span className="material-icons text-sm">autorenew</span>
          </div>
          <span className="text-xl font-bold">AIScribe</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-4">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>
                <a 
                  className="block py-2 text-lg font-medium hover:text-primary dark:hover:text-primary-400"
                  onClick={handleLinkClick}
                >
                  {link.label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
          {user ? (
            <>
              <div className="mb-4 flex items-center space-x-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {user.username.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {user.premium ? 'Premium User' : 'Free Tier'}
                  </p>
                </div>
              </div>
              <Button 
                className="w-full mb-2" 
                variant="default" 
                onClick={() => {
                  onLogout();
                  onClose();
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth">
                <Button 
                  className="w-full mb-2" 
                  onClick={handleLinkClick}
                >
                  Sign up
                </Button>
              </Link>
              <Link href="/auth">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleLinkClick}
                >
                  Sign in
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
