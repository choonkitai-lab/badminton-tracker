'use client';

// ============================================================
// Sidebar navigation component
// — Desktop: fixed left panel
// — Mobile: hamburger button + slide-in drawer
// ============================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Dumbbell,
  Wrench,
  Timer,
  BarChart3,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

// Each item in the sidebar navigation
const navItems = [
  { href: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/rackets',     label: 'Rackets',      icon: Dumbbell },
  { href: '/string-jobs', label: 'String Jobs',  icon: Wrench },
  { href: '/sessions',    label: 'Sessions',     icon: Timer },
  { href: '/statistics',  label: 'Statistics',   icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // On first load, check if user had previously saved a theme preference
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  // Shared nav link list — reused in both desktop and mobile menus
  function NavLinks() {
    return (
      <>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────── */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>🏸</span>
          <span className="font-bold text-sidebar-foreground">StringTracker</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          className="p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Mobile backdrop ────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile slide-in drawer ─────────────────────── */}
      <div
        className={cn(
          'lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border',
          'transform transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-2 mb-6 mt-1">
            <span className="text-2xl" aria-hidden>🏸</span>
            <div>
              <p className="font-bold text-sidebar-foreground">StringTracker</p>
              <p className="text-xs text-sidebar-foreground/60">Badminton String Manager</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1 flex-1">
            <NavLinks />
          </nav>
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      {/* ── Desktop sidebar ────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-sidebar border-r border-sidebar-border p-4 shrink-0">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl" aria-hidden>🏸</span>
          <div>
            <p className="font-bold text-sidebar-foreground">StringTracker</p>
            <p className="text-xs text-sidebar-foreground/60">Badminton String Manager</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          <NavLinks />
        </nav>
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </aside>
    </>
  );
}
