'use client';

import { useEffect, useState } from 'react';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { SidebarNav } from './sidebar-nav';
import { Topbar } from './topbar';

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 px-4 py-4',
        collapsed && 'justify-center px-0'
      )}
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-lg text-primary-foreground shadow-sm">
        ☪️
      </div>
      {!collapsed && (
        <div className="text-sm font-extrabold tracking-tight">
          Quran <span className="text-primary">Saya</span>
        </div>
      )}
    </div>
  );
}

export function AppShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem('cms.sidebar.collapsed');
    if (v) setCollapsed(v === '1');
  }, []);

  function toggle() {
    setCollapsed((v) => {
      const n = !v;
      localStorage.setItem('cms.sidebar.collapsed', n ? '1' : '0');
      return n;
    });
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen flex-col border-r bg-card transition-[width] duration-200 md:flex',
          collapsed ? 'w-[76px]' : 'w-64'
        )}
      >
        <div className="flex items-center justify-between">
          <Brand collapsed={collapsed} />
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 shrink-0"
              onClick={toggle}
              aria-label="Ciutkan sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>
        {collapsed && (
          <div className="flex justify-center pb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Lebarkan sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
        <SidebarNav collapsed={collapsed} />
      </aside>

      {/* Drawer mobile */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigasi</SheetTitle>
          <Brand collapsed={false} />
          <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Konten */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar email={email} onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
