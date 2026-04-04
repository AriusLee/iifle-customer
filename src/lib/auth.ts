const KEY = 'iifle_token';

export const auth = {
  get: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(KEY) : null,
  set: (token: string) => localStorage.setItem(KEY, token),
  clear: () => localStorage.removeItem(KEY),
};
