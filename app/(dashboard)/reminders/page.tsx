import { AlarmClock } from 'lucide-react';
import { ReminderManager } from '@/components/forms/reminder-manager';
import { PageHeader } from '@/components/page-header';

export const dynamic = 'force-dynamic';

export default function RemindersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={AlarmClock}
        title="Reminder Terjadwal"
        description="Pengingat harian yang dikirim cron ke user reminder-on"
      />
      <ReminderManager />
    </div>
  );
}
