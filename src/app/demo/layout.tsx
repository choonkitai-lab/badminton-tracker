import Link from 'next/link';
import { DemoNav } from './demo-nav';

export const metadata = {
  title: 'Demo — StringTracker',
  description: 'See how StringTracker helps you track your badminton racket strings.',
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Demo banner */}
      <div className="bg-amber-50 border-b border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/60">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            👀 <strong>Demo account</strong> — data is read-only. Sign up to track your own rackets and strings.
          </p>
          <Link
            href="/login"
            className="shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            Get started free →
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 pt-4 pb-0">
            <span className="text-xl">🏸</span>
            <span className="font-bold text-foreground">StringTracker</span>
            <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 ml-1">demo</span>
          </div>
          <DemoNav />
        </div>
      </div>

      <main className="max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
