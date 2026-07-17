import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/cms-auth';
import { LoginForm } from '@/components/forms/login-form';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default async function LoginPage() {
  const session = await getAdminSession();
  if (session) redirect('/');
  return (
    <div className="relative grid min-h-screen place-items-center bg-gradient-to-b from-primary/5 to-background p-6">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <LoginForm />
    </div>
  );
}
