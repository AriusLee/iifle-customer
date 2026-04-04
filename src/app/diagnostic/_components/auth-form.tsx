'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        await api.auth.register({ full_name: form.full_name, email: form.email, password: form.password, phone: form.phone || undefined });
      }
      const res = await api.auth.login({ email: form.email, password: form.password });
      auth.set(res.access_token);
      toast.success(isLogin ? t('登录成功', 'Login successful') : t('注册成功', 'Registration successful'));
      onDone();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{isLogin ? t('登录账号', 'Sign In') : t('创建账号', 'Create Account')}</CardTitle>
        <p className="text-sm text-gray-400">
          {isLogin ? t('登录继续诊断', 'Sign in to continue') : t('注册开始诊断', 'Register to begin')}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <Label>{t('姓名', 'Full Name')} *</Label>
              <Input required value={form.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder={t('张三', 'John Doe')} />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label>{t('邮箱', 'Email')} *</Label>
            <Input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="your@email.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t('密码', 'Password')} *</Label>
            <Input required type="password" minLength={8} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder={t('至少8位', 'Min 8 chars')} />
          </div>
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <Label>{t('手机（选填）', 'Phone (optional)')}</Label>
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+60 123456789" />
            </div>
          )}
          <Button type="submit" disabled={loading} className="cursor-pointer mt-2 h-10 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg font-semibold">
            {loading ? t('请稍候...', 'Please wait...') : isLogin ? t('登录', 'Sign In') : t('注册', 'Register')}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="cursor-pointer text-sm text-emerald-600 hover:underline">
            {isLogin ? t('没有账号？注册', "No account? Register") : t('已有账号？登录', 'Have an account? Sign In')}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
