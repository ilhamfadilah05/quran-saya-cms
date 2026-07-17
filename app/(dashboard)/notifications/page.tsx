import { Send } from 'lucide-react';
import { NotificationComposer } from '@/components/forms/notification-composer';
import { CronControls } from '@/components/forms/cron-controls';
import { PageHeader } from '@/components/page-header';

export const dynamic = 'force-dynamic';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Send}
        title="Kirim Notifikasi"
        description="Broadcast bertarget + kontrol cron"
      />
      <NotificationComposer />
      <CronControls />
    </div>
  );
}
