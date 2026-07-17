import {
  LayoutDashboard,
  GraduationCap,
  Users,
  ScrollText,
  Send,
  AlarmClock,
  Sunrise,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = { href: string; label: string; icon: LucideIcon };
export type NavGroup = { section: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  {
    section: 'Monitoring',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/learning', label: 'Analitik Belajar', icon: GraduationCap },
      { href: '/users', label: 'Pengguna', icon: Users },
      { href: '/logs', label: 'Log Notifikasi', icon: ScrollText },
    ],
  },
  {
    section: 'Manajemen',
    items: [
      { href: '/notifications', label: 'Kirim Notifikasi', icon: Send },
      { href: '/reminders', label: 'Reminder', icon: AlarmClock },
      { href: '/adzan', label: 'Adzan', icon: Sunrise },
    ],
  },
];

export function isActivePath(itemHref: string, pathname: string): boolean {
  return itemHref === '/' ? pathname === '/' : pathname.startsWith(itemHref);
}

export function titleForPath(pathname: string): string {
  for (const g of NAV) {
    for (const it of g.items) {
      if (isActivePath(it.href, pathname)) return it.label;
    }
  }
  return 'Quran Saya CMS';
}
