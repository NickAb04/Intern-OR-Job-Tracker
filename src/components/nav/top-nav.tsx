"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Table2, BarChart3, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

interface TopNavProps {
  email: string;
  displayName?: string | null;
}

const navLinks = [
  { href: "/map", label: "Map", icon: MapPin },
  { href: "/applications", label: "Applications", icon: Table2 },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

export function TopNav({ email, displayName }: TopNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="flex h-14 items-center px-4 md:px-6">
        {/* Logo / App name */}
        <Link
          href="/map"
          id="nav-home"
          className="mr-6 flex items-center gap-2 font-semibold tracking-tight"
        >
          <MapPin className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">JobTracker</span>
        </Link>

        {/* Desktop navigation links */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              id={`nav-${label.toLowerCase()}`}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side: theme toggle + user menu */}
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <UserMenu email={email} displayName={displayName} />

          {/* Mobile hamburger */}
          <button
            id="mobile-menu-toggle"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation dropdown */}
      {mobileMenuOpen && (
        <nav className="border-t px-4 py-2 sm:hidden">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
