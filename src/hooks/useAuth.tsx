import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'https://app.qafah.com';

export interface AuthUser {
  username: string;
  role: 'admin' | 'market_supervisor' | 'us_market_supervisor' | 'employee' | 'user';
  email?: string;
  full_name?: string;
  due_date?: string;
  is_active?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// ── JWT helpers ──────────────────────────────────────────────────────────────
function decodeJWT(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload?.exp) return true;
  return Date.now() / 1000 > payload.exp;
}

// ── Storage ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'qafah_auth';

export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
}

export function loadSession(): { token: string; user: AuthUser } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.user) return null;
    if (isTokenExpired(parsed.token)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Role → page mapping ──────────────────────────────────────────────────────
export function getRoleHomePage(role: AuthUser['role']): string {
  switch (role) {
    case 'admin':                return 'admin';
    case 'market_supervisor':
    case 'us_market_supervisor':
    case 'employee':             return 'employee';
    default:                     return 'dashboard';
  }
}

// ── Fetch /auth/me with Bearer token ─────────────────────────────────────────
async function fetchMe(token: string): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      username:  data.username  ?? data.sub ?? '',
      role:      data.role      ?? 'user',
      email:     data.email,
      full_name: data.full_name,
      due_date:  data.due_date,
      is_active: data.is_active ?? true,
    };
  } catch {
    return null;
  }
}

// ── Parse error message from any response shape ───────────────────────────────
async function extractErrorMessage(res: Response): Promise<string> {
  const FALLBACK = 'اسم المستخدم أو كلمة المرور غير صحيحة';
  try {
    const ct = res.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      const body = await res.json();
      if (typeof body?.detail === 'string') return body.detail;
      if (Array.isArray(body?.detail)) return body.detail.map((d: any) => d.msg).join(', ');
      if (typeof body?.error === 'string') return body.error;
      if (typeof body?.message === 'string') return body.message;
    }
    if (res.status === 401 || res.status === 403 || res.status === 400) return FALLBACK;
    if (res.status >= 500) return 'خطأ في الخادم، يرجى المحاولة لاحقاً';
  } catch {
    // ignore parse errors
  }
  return FALLBACK;
}

// ══════════════════════════════════════════════════════════════════════════════
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null,
  });

  // ── Restore session on mount ───────────────────────────────────────────────
  useEffect(() => {
    const session = loadSession();
    if (session) {
      setState({ user: session.user, token: session.token, isLoading: false, error: null });
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (
    username: string,
    password: string,
    rememberMe = true,
  ): Promise<{ success: boolean; role?: AuthUser['role']; error?: string }> => {
    setState(s => ({ ...s, isLoading: true, error: null }));

    const formBody = new URLSearchParams({ username, password }).toString();

    try {
      // ── Step 1: try /auth/token ──────────────────────────────────────
      const res = await fetch(`${API_BASE}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody,
      });

      let token: string | null = null;
      let user: AuthUser | null = null;

      if (res.ok) {
        const contentType = res.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          token = data.access_token ?? data.token ?? null;
        }
      } else if (res.status === 400 || res.status === 401 || res.status === 403) {
        const msg = await extractErrorMessage(res);
        setState(s => ({ ...s, isLoading: false, error: msg }));
        return { success: false, error: msg };
      }

      // ── Step 2: if no token yet, try /auth/token-json ────────────────
      if (!token) {
        const jsonRes = await fetch(`${API_BASE}/auth/token-json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formBody,
        });

        if (jsonRes.ok) {
          const data = await jsonRes.json().catch(() => ({}));
          token = data.access_token ?? data.token ?? null;
        } else {
          const msg = await extractErrorMessage(jsonRes);
          setState(s => ({ ...s, isLoading: false, error: msg }));
          return { success: false, error: msg };
        }
      }

      // ── Step 3: decode user from JWT payload ─────────────────────────
      if (token) {
        const payload = decodeJWT(token);
        user = {
          username:  payload?.sub       ?? username,
          role:      payload?.role      ?? 'user',
          email:     payload?.email,
          full_name: payload?.full_name,
          due_date:  payload?.due_date,
          is_active: payload?.is_active ?? true,
        };
      }

      // ── Step 4: fallback — fetch /auth/me with Bearer token ──────────
      if (!user && token) {
        user = await fetchMe(token);
      }

      if (!user) {
        const msg = 'تعذّر تسجيل الدخول، حاول مجدداً';
        setState(s => ({ ...s, isLoading: false, error: msg }));
        return { success: false, error: msg };
      }

      if (rememberMe && token) saveSession(token, user);
      setState({ user, token, isLoading: false, error: null });
      return { success: true, role: user.role };

    } catch (e: any) {
      console.error('Login error:', e);
      const msg = 'خطأ في الاتصال بالخادم';
      setState(s => ({ ...s, isLoading: false, error: msg }));
      return { success: false, error: msg };
    }
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (data: {
    username: string;
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setState(s => ({ ...s, isLoading: true, error: null }));

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = body?.detail ?? body?.error ?? 'فشل إنشاء الحساب';
        setState(s => ({ ...s, isLoading: false, error: msg }));
        return { success: false, error: msg };
      }

      setState(s => ({ ...s, isLoading: false }));
      return { success: true };
    } catch {
      const msg = 'خطأ في الاتصال بالخادم';
      setState(s => ({ ...s, isLoading: false, error: msg }));
      return { success: false, error: msg };
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const token = state.token;
    clearSession();

    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      // ignore — local session already cleared
    }

    setState({ user: null, token: null, isLoading: false, error: null });
  }, [state.token]);

  return {
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    error: state.error,
    isAuthenticated: !!state.user,
    login,
    register,
    logout,
  };
}