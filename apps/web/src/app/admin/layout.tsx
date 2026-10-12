'use client';

import { CrmShell } from '@/components/admin/crm-shell';
import { AuthGuard } from '@/components/shared/auth-guard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRoles={['ADMIN', 'SUPER_ADMIN']} roleFallbackType="admin">
      <CrmShell>
        {children}
      </CrmShell>
    </AuthGuard>
  );
}
