import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Smartphone, 
  LayoutDashboard, 
  FileCode2, 
  Package, 
  ShieldCheck, 
  Languages, 
  Download, 
  Sparkles,
  Glasses
} from 'lucide-react';
import { PhoneSimulator } from './components/PhoneSimulator';
import { ComposeDashboard } from './components/ComposeDashboard';
import { CodeExplorer } from './components/CodeExplorer';
import { ApkGuideModal } from './components/ApkGuideModal';
import { PermissionsWizard } from './components/PermissionsWizard';
import { GitHubAutoBuilderModal } from './components/GitHubAutoBuilderModal';
import { downloadAndroidProjectZip } from './utils/zipExporter';

type ActiveView = 'simulator' | 'dashboard' | 'githubBuilder' | 'code' | 'apkGuide' | 'permissions';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [activeView, setActiveView] = useState<ActiveView>('simulator');
  const [currentAppId, setCurrentAppId] = useState<string>('tiktok');
  const [todayCount, setTodayCount] = useState<number>(42);
  const [dailyGoal, setDailyGoal] = useState<number>(100);
  const [isFloatingActive, setIsFloatingActive] = useState<boolean>(true);
  const [hasOverlayPermission, setHasOverlayPermission] = useState<boolean>(true);
  const [hasAccessibilityPermission, setHasAccessibilityPermission] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Per app mock initial state
  const [appCounts, setAppCounts] = useState<Record<string, number>>({
    tiktok: 22,
    instagram: 12,
    youtube: 6,
    facebook: 2,
    snapchat: 0,
  });

  const handleIncrementCount = (appId: string) => {
    setTodayCount((prev) => {
      const next = prev + 1;
      if (next === dailyGoal) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
      return next;
    });

    setAppCounts((prev) => ({
      ...prev,
      [appId]: (prev[appId] || 0) + 1,
    }));
  };

  const handleResetCount = () => {
    setTodayCount(0);
    setAppCounts({
      tiktok: 0,
      instagram: 0,
      youtube: 0,
      facebook: 0,
      snapchat: 0,
    });
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      await downloadAndroidProjectZip();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => setIsDownloading(false), 800);
    } catch (e) {
      console.error(e);
      setIsDownloading(false);
    }
  };

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white"
    >
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Glasses className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {lang === 'ar' ? 'عداد الفيديوهات القصيرة الذكي' : 'ShortsCounter Pro'}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold hidden sm:inline">
                Kotlin & Jetpack Compose
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {lang === 'ar'
                ? 'خدمة Accessibility + ودجت عائم Foreground + قاعدة بيانات Room'
                : 'Accessibility Service + Floating Foreground Overlay + Room DB'}
            </p>
          </div>
        </div>

        {/* Global Controls: Download Zip & Lang Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isDownloading
                ? lang === 'ar'
                  ? 'جاري التحميل...'
                  : 'Downloading...'
                : lang === 'ar'
                ? 'تحميل مشروع أندرويد (.ZIP)'
                : 'Download Android (.ZIP)'}
            </span>
            <span className="sm:hidden">ZIP</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold hover:border-slate-700 transition-colors"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <nav className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-8 py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 max-w-5xl mx-auto">
          <button
            onClick={() => setActiveView('simulator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeView === 'simulator'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{lang === 'ar' ? '📱 محاكي الهاتف الحي (Simulator)' : '📱 Mobile Simulator'}</span>
          </button>

          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeView === 'dashboard'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{lang === 'ar' ? '📊 واجهة الداشبورد (Compose UI)' : '📊 Compose Dashboard'}</span>
          </button>

          <button
            onClick={() => setActiveView('githubBuilder')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeView === 'githubBuilder'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25 ring-1 ring-cyan-300'
                : 'text-cyan-400 hover:text-white hover:bg-cyan-950/40 border border-cyan-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>{lang === 'ar' ? '🚀 اربط GitHub وابنِ الـ APK تلقائياً' : '🚀 1-Click GitHub APK Builder'}</span>
          </button>

          <button
            onClick={() => setActiveView('code')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeView === 'code'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>{lang === 'ar' ? '💻 كود المشروع (Kotlin & XML)' : '💻 Project Source Files'}</span>
          </button>

          <button
            onClick={() => setActiveView('apkGuide')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeView === 'apkGuide'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{lang === 'ar' ? '📦 خطوات تصدير APK' : '📦 Build APK Guide'}</span>
          </button>

          <button
            onClick={() => setActiveView('permissions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeView === 'permissions'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{lang === 'ar' ? '🛡️ إعداد الصلاحيات' : '🛡️ Permissions'}</span>
          </button>
        </div>
      </nav>

      {/* Main Dynamic View Content */}
      <main className="flex-1 flex flex-col justify-start">
        {activeView === 'simulator' && (
          <div className="w-full flex flex-col items-center py-4">
            {/* Context Notice */}
            <div className="max-w-xl mx-auto px-4 mb-2 text-center">
              <span className="text-xs text-cyan-300/80 bg-cyan-950/40 border border-cyan-900/60 px-3 py-1 rounded-full">
                {lang === 'ar'
                  ? '⚡ جرب سحب الفيديوهات للأعلى لمشاهدة تفاعل خدمة الـ Accessibility والأيقونة العائمة المباشرة'
                  : '⚡ Try swiping videos upward to test live scroll detection & VR widget'}
              </span>
            </div>

            <PhoneSimulator
              currentAppId={currentAppId}
              onSelectApp={setCurrentAppId}
              todayCount={todayCount}
              onIncrementCount={handleIncrementCount}
              isFloatingWidgetActive={isFloatingActive}
              onToggleFloatingWidget={setIsFloatingActive}
              onOpenDashboard={() => setActiveView('dashboard')}
              lang={lang}
            />
          </div>
        )}

        {activeView === 'dashboard' && (
          <ComposeDashboard
            todayCount={todayCount}
            appCounts={appCounts}
            dailyGoal={dailyGoal}
            onChangeDailyGoal={setDailyGoal}
            isFloatingActive={isFloatingActive}
            onToggleFloating={setIsFloatingActive}
            onResetCount={handleResetCount}
            onOpenCodeExplorer={() => setActiveView('code')}
            onOpenApkGuide={() => setActiveView('apkGuide')}
            lang={lang}
          />
        )}

        {activeView === 'githubBuilder' && (
          <GitHubAutoBuilderModal
            onClose={() => setActiveView('simulator')}
            lang={lang}
          />
        )}

        {activeView === 'code' && <CodeExplorer lang={lang} />}

        {activeView === 'apkGuide' && (
          <ApkGuideModal
            onClose={() => setActiveView('simulator')}
            lang={lang}
          />
        )}

        {activeView === 'permissions' && (
          <PermissionsWizard
            hasOverlayPermission={hasOverlayPermission}
            hasAccessibilityPermission={hasAccessibilityPermission}
            onToggleOverlay={() => setHasOverlayPermission(!hasOverlayPermission)}
            onToggleAccessibility={() => setHasAccessibilityPermission(!hasAccessibilityPermission)}
            lang={lang}
          />
        )}
      </main>

      {/* Persistent Bottom Status Indicator */}
      <footer className="py-3 px-6 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {lang === 'ar'
              ? 'خدمة Accessibility نشطة • خدمة الودجت العائم Foreground تعمل'
              : 'Accessibility Service Hooked • Floating Widget Running'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>{lang === 'ar' ? 'فيديوهات اليوم:' : "Today's count:"} <strong className="text-cyan-400 font-mono">{todayCount}</strong></span>
          <span>Target SDK 34 (Android 14)</span>
        </div>
      </footer>
    </div>
  );
}
