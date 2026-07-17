'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV, isActivePath } from './nav-config';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {NAV.map((g) => (
        <div key={g.section} className="mb-1">
          {!collapsed && (
            <div className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {g.section}
            </div>
          )}
          {g.items.map((it) => {
            const active = isActivePath(it.href, pathname);
            const Icon = it.icon;
            const link = (
              <Link
                href={it.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  collapsed && 'justify-center px-0'
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span>{it.label}</span>}
              </Link>
            );

            if (!collapsed) return <div key={it.href}>{link}</div>;
            return (
              <TooltipProvider key={it.href} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{it.label}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
