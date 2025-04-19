import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import MobileMenu from "./mobile-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Moon, Sun, Menu } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinks = [
    { href: "/", label: "Home", active: location === "/" },
    { href: "/dashboard", label: "Dashboard", active: location === "/dashboard" },
    { href: "/#pricing", label: "Pricing", active: false },
    { href: "/#features", label: "About", active: false },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
              <span className="font-bold text-sm">AI</span>
            </div>
            <Link href="/">
              <span className="text-xl font-bold cursor-pointer">AIScribe</span>
            </Link>
          </div>
          
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <a className={`font-medium ${link.active ? 'text-primary dark:text-primary-400' : 'hover:text-primary dark:hover:text-primary-400'}`}>
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            
            {user ? (
              <div className="hidden md:flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 p-1">
                      <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center">
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          {user.username.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/auth">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              <Menu />
            </Button>
          </div>
        </div>
      </header>
      
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={toggleMobileMenu} 
        user={user} 
        onLogout={handleLogout}
      />
    </>
  );
}
