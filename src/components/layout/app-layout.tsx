// ============================================================
// AppLayout — wraps every page with sidebar + content area
// This is a Server Component (no 'use client' needed).
// Sidebar is a Client Component and handles its own interactivity.
// ============================================================

import Sidebar from '@/components/layout/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      {/* Main content area grows to fill remaining width */}
      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
