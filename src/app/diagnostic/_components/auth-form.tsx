'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useT } from '@/lib/i18n';
import { toast } from 'sonner';

export function AuthForm({ onDone }: { onDone: () => void }) {
  const { t } = useT();
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isLogin) {
        await api.auth.register({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
        });
      }
      const res = await api.auth.login({ email: form.email, password: form.password });
      auth.set(res.access_token);
      toast.success(isLogin ? t('登录成功', 'Signed in') : t('注册成功', 'Account created'));
      onDone();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Decorative gold pill above the card */}
      <div className="flex justify-center mb-4">
        <span className="eyebrow px-3 py-1 rounded-full bg-[var(--gold-soft)]">
          {isLogin ? t('登录', 'Sign In') : t('创建账号', 'Create Account')}
        </span>
      </div>

      <div className="card-gold-accent p-8">
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-1.5">
            {isLogin
              ? t('欢迎回来', 'Welcome back')
              : t('开始你的独角兽诊断', 'Start your Unicorn Diagnostic')}
          </h2>
          <p className="text-sm text-slate-500">
            {isLogin
              ? t('登录即可继续之前的进度', 'Sign in to continue where you left off')
              : t('三分钟注册 · 十五分钟完成诊断', '3 min to register · 15 min to complete')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <Field label={t('姓名', 'Full Name')} required>
              <Input
                required
                value={form.full_name}
                onChange={(e) => set('full_name', e.target.value)}
                placeholder={t('张三', 'John Doe')}
                className="h-11"
              />
            </Field>
          )}
          <Field label={t('邮箱', 'Email')} required>
            <Input
              required
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="your@email.com"
              className="h-11"
            />
          </Field>
          <Field label={t('密码', 'Password')} required>
            <Input
              required
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder={t('至少 8 位', 'Min. 8 characters')}
              className="h-11"
            />
          </Field>
          {!isLogin && (
            <Field label={t('手机', 'Phone')} hint={t('选填', 'optional')}>
              <Input
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+60 123 456 789"
                className="h-11"
              />
            </Field>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2 h-11 w-full text-base"
          >
            {loading
              ? t('请稍候…', 'Please wait…')
              : isLogin
                ? t('登录', 'Sign In')
                : t('创建账号 →', 'Create Account →')}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="cursor-pointer text-sm text-slate-500 hover:text-[var(--gold-dark)] transition-colors"
          >
            {isLogin ? (
              <>
                {t('还没有账号？', "Don't have an account? ")}
                <span className="font-semibold text-[var(--gold-dark)] underline-offset-4 hover:underline">
                  {t('立即注册', 'Register')}
                </span>
              </>
            ) : (
              <>
                {t('已有账号？', 'Already registered? ')}
                <span className="font-semibold text-[var(--gold-dark)] underline-offset-4 hover:underline">
                  {t('登录', 'Sign in')}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Trust row below the card */}
      <p className="mt-6 text-center text-[11px] text-slate-400 tracking-wider">
        {t('企业级加密 · 邮箱与密码仅用于保存诊断进度', 'Enterprise-grade encryption · only used to save your progress')}
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
