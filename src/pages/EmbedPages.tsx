/**
 * EmbedPages.tsx
 *
 * Uses fetch() with Authorization header to load the HTML, then injects it
 * into an iframe via srcdoc — this bypasses the backend's cookie-based
 * session check entirely because the token is sent as a Bearer header,
 * not as a query param that arrives after get_current_user already ran.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Moon, Sun, LogOut, RefreshCw, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import type { AuthUser } from '@/hooks/useAuth';

const API_BASE = 'https://app.qafah.com';

type Page =
  | 'home' | 'login' | 'register' | 'pricing' | 'education'
  | 'admin' | 'dashboard' | 'alerts' | 'employee' | 'leaderboard'
  | 'admin-employees' | 'companies-accumulation' | 'premarket'
  | 'ticker-resell-signals' | 'loads-detail' | 'crossing-report' | 'etfs-report';

interface EmbedPageProps {
  navigate:  (page: Page) => void;
  onLogout?: () => void;
  user?: AuthUser | null;
}

function getStoredToken(): string {
  return (
    localStorage.getItem('access_token') ??
    localStorage.getItem('token') ??
    sessionStorage.getItem('access_token') ??
    ''
  );
}

// ─── Shared fetch-and-embed shell ─────────────────────────────────────────────
function EmbedShell({
  navigate,
  onLogout,
  user,
  activePage,
  title,
  fetchUrl,      // the URL to GET with Authorization header
  externalUrl,   // the URL to open in a new tab (same, with token in QS as fallback)
  isDark,
  onToggleDark,
  icon,
}: EmbedPageProps & {
  activePage: Page;
  title: string;
  fetchUrl: string;
  externalUrl: string;
  isDark: boolean;
  onToggleDark: () => void;
  icon: React.ReactNode;
}) {
  const [srcdoc, setSrcdoc]     = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const iframeRef               = useRef<HTMLIFrameElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSrcdoc(null);

    try {
      const token = getStoredToken();
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(fetchUrl, { headers });

      if (res.status === 401 || res.status === 403) {
        throw new Error(`خطأ في المصادقة (${res.status}) — يرجى تسجيل الدخول من جديد.`);
      }
      if (!res.ok) {
        throw new Error(`فشل الطلب: HTTP ${res.status}`);
      }

      const html = await res.text();

      // Rewrite relative URLs inside the fetched HTML so assets load correctly
      const rewritten = html
        // src="/..." → src="https://app.qafah.com/..."
        .replace(/(\s(?:src|href|action))="\/(?!\/)/g, `$1="${API_BASE}/`)
        // url('/...') in CSS
        .replace(/url\('\/(?!\/)/g, `url('${API_BASE}/`)
        .replace(/url\("\/(?!\/)/g, `url("${API_BASE}/`);

      setSrcdoc(rewritten);
    } catch (e: any) {
      setError(e.message ?? 'حدث خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  }, [fetchUrl]);

  // Initial load
  useEffect(() => { load(); }, [load]);

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark bg-slate-900' : 'bg-slate-50'}`} dir="rtl">
      {/* Navbar */}
      <div className="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-5 justify-between sticky top-0 z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDark}
            className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors disabled:opacity-50"
            title="إعادة تحميل"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-9 h-9 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center text-red-500"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-sm">
          {icon} {title}
        </div>

        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          فتح في تبويب جديد
        </a>
      </div>

      <div className="flex flex-1 min-h-0">
        <AppSidebar navigate={navigate} onLogout={onLogout} user={user} activePage={activePage} />

        <div className="flex-1 relative min-h-0">
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/95 dark:bg-slate-900/95 z-10 gap-4">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              <p className="text-sm text-slate-500 dark:text-slate-400">جارٍ تحميل {title}…</p>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 z-10 gap-4 p-8">
              <AlertCircle className="w-12 h-12 text-red-400" />
              <p className="text-sm text-red-500 font-medium text-center max-w-md">{error}</p>
              <button
                onClick={load}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* The iframe — populated via srcdoc, never via src= */}
          {srcdoc && (
            <iframe
              ref={iframeRef}
              srcDoc={srcdoc}
              className="w-full h-full border-0"
              style={{ minHeight: 'calc(100vh - 56px)' }}
              title={title}
              // allow-same-origin is intentionally omitted to keep the
              // injected page sandboxed; scripts still work via allow-scripts
              sandbox="allow-scripts allow-forms allow-popups allow-modals"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Crossing Report Page
// ═════════════════════════════════════════════════════════════════════════════
export function CrossingPage({ navigate, onLogout, user }: EmbedPageProps) {
  const [isDark, setIsDark] = useState(false);
  const token = getStoredToken();

  return (
    <EmbedShell
      navigate={navigate}
      onLogout={onLogout}
      user={user}
      activePage="crossing-report"
      title="تقرير الاختراقات"
      fetchUrl={`${API_BASE}/?view=crossing`}
      externalUrl={`${API_BASE}/?view=crossing${token ? `&token=${encodeURIComponent(token)}` : ''}`}
      isDark={isDark}
      onToggleDark={() => setIsDark(p => !p)}
      icon={<span className="text-lg">📊</span>}
    />
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ETFs Report Page
// ═════════════════════════════════════════════════════════════════════════════
export function ETFsReportPage({ navigate, onLogout, user }: EmbedPageProps) {
  const [isDark, setIsDark] = useState(false);
  const token = getStoredToken();

  return (
    <EmbedShell
      navigate={navigate}
      onLogout={onLogout}
      user={user}
      activePage="etfs-report"
      title="تقارير الأحمال"
      fetchUrl={`${API_BASE}/?view=etfs_report`}
      externalUrl={`${API_BASE}/?view=etfs_report${token ? `&token=${encodeURIComponent(token)}` : ''}`}
      isDark={isDark}
      onToggleDark={() => setIsDark(p => !p)}
      icon={<span className="text-lg">📈</span>}
    />
  );
}