import { requireAdminPageSession } from '@/lib/cms-auth';
import { AppShell } from '@/components/layout/app-shell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminPageSession();
  return <AppShell email={session.email}>{children}</AppShell>;
}
