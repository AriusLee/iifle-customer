'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { toast } from 'sonner';

export function CompanyForm({ onDone }: { onDone: (diagnosticId: string) => void }) {
  const { t } = useT();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    legal_name: '',
    country: 'Malaysia',
    contact_person: '',
    contact_phone: '',
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.diagnostics.create({
        company: {
          legal_name: form.legal_name,
          country: form.country,
          contact_person: form.contact_person || undefined,
          contact_phone: form.contact_phone || undefined,
        },
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
    <div className="mx-auto w-full max-w-md">
      <div className="flex justify-center mb-4">
        <span className="eyebrow px-3 py-1 rounded-full bg-[var(--gold-soft)]">
          {t('第 1 步 · 共 2 步', 'Step 1 of 2')}
        </span>
      </div>

      <div className="card-gold-accent p-8">
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-1.5">
            {t('告诉我们你的企业', 'Tell us about your company')}
          </h2>
          <p className="text-sm text-slate-500">
            {t('用于生成专属于你的诊断报告', 'Used to tailor your diagnostic report')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label={t('企业名称', 'Company Name')} required>
            <Input
              required
              value={form.legal_name}
              onChange={(e) => set('legal_name', e.target.value)}
              placeholder={t('如：XX有限公司', 'e.g. Acme Sdn Bhd')}
              className="h-11"
            />
          </Field>
          <Field label={t('国家', 'Country')}>
            <Input
              value={form.country}
              onChange={(e) => set('country', e.target.value)}
              className="h-11"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t('联系人', 'Contact Person')} hint={t('选填', 'optional')}>
              <Input
                value={form.contact_person}
                onChange={(e) => set('contact_person', e.target.value)}
                className="h-11"
              />
            </Field>
            <Field label={t('联系电话', 'Contact Phone')} hint={t('选填', 'optional')}>
              <Input
                value={form.contact_phone}
                onChange={(e) => set('contact_phone', e.target.value)}
                placeholder="+60 123 456 789"
                className="h-11"
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2 h-11 w-full text-base"
          >
            {loading ? t('请稍候…', 'Please wait…') : t('开始问卷 →', 'Start questionnaire →')}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-[11px] text-slate-400 tracking-wider">
        {t('所有信息仅用于生成诊断报告 · 不会对外分享', 'Used only to generate your diagnostic · never shared externally')}
      </p>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
          {label} {required && <span className="text-[var(--gold)]">*</span>}
        </Label>
        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
