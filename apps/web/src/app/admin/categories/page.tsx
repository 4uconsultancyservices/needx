'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useCategories } from '@/hooks/use-categories';
import { AdminResourceTable } from '@/components/admin/admin-resource-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api-client';
import { slugify } from '@/lib/utils';
import type { Category } from '@needx/types';

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const create = useMutation({
    mutationFn: () => api.post('/categories', { name, slug: slugify(name), keywords: [], attributes: [] }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created');
      setOpen(false);
      setName('');
    },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, activate }: { id: string; activate: boolean }) => api.patch(`/categories/${id}/${activate ? 'activate' : 'deactivate'}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="default" size="sm" onClick={() => setOpen(true)}>
          <Plus /> New category
        </Button>
      </div>
      <AdminResourceTable<Category>
        items={categories}
        isLoading={isLoading}
        getRowKey={(c) => c.id}
        columns={[
          { header: 'Name', render: (c) => <span className="font-medium text-ink">{c.name}</span> },
          { header: 'Slug', render: (c) => <span className="font-mono-num text-xs text-ink-faint">{c.slug}</span> },
          { header: 'Keywords', render: (c) => c.keywords.slice(0, 4).join(', ') || '—' },
          { header: 'Status', render: (c) => <Badge variant={c.isActive ? 'faith' : 'default'}>{c.isActive ? 'Active' : 'Inactive'}</Badge> },
          {
            header: 'Actions',
            render: (c) => (
              <Button size="sm" variant="outline" onClick={() => toggleActive.mutate({ id: c.id, activate: !c.isActive })}>
                {c.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            ),
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Musical Instruments" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" loading={create.isPending} disabled={!name} onClick={() => create.mutate()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
