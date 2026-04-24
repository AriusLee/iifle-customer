import { auth } from './auth';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2030/api/v1';

async function f<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((opts.headers as Record<string, string>) || {}),
  };
  const token = auth.get();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg =
      typeof body.detail === 'string'
        ? body.detail
        : Array.isArray(body.detail)
        ? body.detail.map((e: any) => e.msg || JSON.stringify(e)).join('; ')
        : `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; full_name: string; phone?: string }) =>
      f<{ id: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      f<{ access_token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  },
  diagnostics: {
    create: (data: { company: { legal_name: string; country?: string; contact_person?: string; contact_phone?: string } }) =>
      f<any>('/diagnostics', { method: 'POST', body: JSON.stringify(data) }),
    list: () => f<any[]>('/diagnostics/mine'),
    get: (id: string) => f<any>(`/diagnostics/${id}`),
    saveDraft: (id: string, data: { answers: Record<string, string | string[]>; other_answers?: Record<string, string> }) =>
      f<any>(`/diagnostics/${id}/draft`, { method: 'PUT', body: JSON.stringify(data) }),
    submitSection: (id: string, section: string, data: { answers: Record<string, string | string[]>; other_answers?: Record<string, string> }) =>
      f<any>(`/diagnostics/${id}/sections/${section}/submit`, { method: 'POST', body: JSON.stringify(data) }),
    submit: (id: string) =>
      f<any>(`/diagnostics/${id}/submit`, { method: 'POST' }),
    generateReport: (id: string) =>
      f<any>(`/diagnostics/${id}/generate-report`, { method: 'POST' }),
  },
  battlemaps: {
    // Customer surface: create, read, per-section submit. Report generation
    // and the 10-chapter viewer live only in the advisor dashboard.
    createForDiagnostic: (diagnosticId: string) =>
      f<any>(`/diagnostics/${diagnosticId}/battlemap`, { method: 'POST' }),
    listMine: () => f<any[]>('/battlemaps/mine'),
    get: (id: string) => f<any>(`/battlemaps/${id}`),
    saveDraft: (id: string, data: { answers: Record<string, string | string[]>; other_answers?: Record<string, string> }) =>
      f<any>(`/battlemaps/${id}/draft`, { method: 'PUT', body: JSON.stringify(data) }),
    submitSection: (id: string, sectionKey: string, data: { answers: Record<string, string | string[]>; other_answers?: Record<string, string> }) =>
      f<any>(`/battlemaps/${id}/sections/${sectionKey}/submit`, { method: 'POST', body: JSON.stringify(data) }),
  },
};
