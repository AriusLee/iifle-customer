'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { toast } from 'sonner';

export function CompanyForm({ onDone }: { onDone: (diagnosticId: string) => void }) {
  const { t } = useT();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ legal_name: '', country: 'Malaysia', contact_person: '', contact_phone: '' });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.diagnostics.create({
        company: { legal_name: form.legal_name, country: form.country, contact_person: form.contact_person || undefined, contact_phone: form.contact_phone || undefined },
      });
      toast.success(t('企业信息已保存', 'Company info saved'));
      onDone(res.id);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{t('企业基本信息', 'Company Information')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>{t('企业名称', 'Company Name')} *</Label>
            <Input required value={form.legal_name} onChange={(e) => set('legal_name', e.target.value)} placeholder={t('XX有限公司', 'Acme Corp')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t('国家', 'Country')}</Label>
            <Input value={form.country} onChange={(e) => set('country', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t('联系人', 'Contact Person')}</Label>
            <Input value={form.contact_person} onChange={(e) => set('contact_person', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t('联系电话', 'Contact Phone')}</Label>
            <Input value={form.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} placeholder="+60 123456789" />
          </div>
          <Button type="submit" disabled={loading} className="cursor-pointer mt-2 h-10 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg font-semibold">
            {loading ? t('请稍候...', 'Please wait...') : t('下一步', 'Next')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
