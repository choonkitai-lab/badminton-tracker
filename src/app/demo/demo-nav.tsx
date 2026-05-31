'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Dumbbell, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/demo',             label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/demo/rackets',     label: 'Rackets',    icon: Dumbbell },
  { href: '/demo/string-jobs', label: 'String Jobs', icon: Wrench },
];

export function DemoNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-0">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              active
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
