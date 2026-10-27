import React, { useState } from 'react';
import { 
  Glasses, 
  Flame, 
  Clock, 
  Target, 
  RotateCcw, 
  Bell, 
  ShieldCheck, 
  Smartphone, 
  TrendingUp, 
  Layers, 
  Check, 
  ChevronRight, 
  Settings,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { TARGET_APPS, calculateEstimatedMinutes, calculateGoalProgress, isGoalExceeded } from '../utils/counterEngine';

interface ComposeDashboardProps {
  todayCount: number;
  appCounts: Record<string, number>;
  dailyGoal: number;
  onChangeDailyGoal: (goal: number) => void;
  isFloatingActive: boolean;
  onToggleFloating: (val: boolean) => void;
  onResetCount: () => void;
  onOpenCodeExplorer: () => void;
  onOpenApkGuide: () => void;
  lang: 'ar' | 'en';
}

export const ComposeDashboard: React.FC<ComposeDashboardProps> = ({
  todayCount,
  appCounts,
  dailyGoal,
  onChangeDailyGoal,
  isFloatingActive,
  onToggleFloating,
  onResetCount,
  onOpenCodeExplorer,
  onOpenApkGuide,
  lang,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'settings'>('today');

  const progressPercent = calculateGoalProgress(todayCount, dailyGoal);
  const estimatedMins = calculateEstimatedMinutes(todayCount, 24);
  const exceeded = isGoalExceeded(todayCount, dailyGoal);

  // Hourly mock curve (24h)
  const hourlyData = [
    { hour: '08:00', count: Math.round(todayCount * 0.08) },
    { hour: '11:00', count: Math.round(todayCount * 0.15) },
    { hour: '14:00', count: Math.round(todayCount * 0.22) },
    { hour: '17:00', count: Math.round(todayCount * 0.18) },
    { hour: '20:00', count: Math.round(todayCount * 0.25) },
    { hour: '23:00', count: Math.round(todayCount * 0.12) },
  ];

  const maxHourVal = Math.max(...hourlyData.map((d) => d.count), 1);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-4 sm:p-6 pb-20">
      {/* Compose Material 3 Top App Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Glasses className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {lang === 'ar' ? 'عداد الفيديوهات الذكي' : 'ShortsCounter Dashboard'}
            </h1>
            <p className="text-xs text-slate-400">
              {lang === 'ar' ? 'Jetpack Compose • Material 3 UI' : 'Jetpack Compose • Material 3 UI'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === 'today' ? 'settings' : 'today')}
            className={`p-2.5 rounded-xl border transition-all ${
              activeTab === 'settings'
                ? 'bg-cyan-500 text-white border-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Settings"
            aria-label="Toggle settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-red-400 hover:border-red-900/50 transition-colors"
            title="Reset Today"
            aria-label="Reset counter"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeTab === 'today' ? (
        <>
          {/* Main Hero Card: Live Ring & Counters */}
          <div
            className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-2xl transition-colors duration-500 ${
              exceeded
                ? 'bg-gradient-to-br from-red-950/60 via-slate-900 to-slate-950 border-red-500/40 ring-1 ring-red-500/30'
                : 'bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border-cyan-500/30 ring-1 ring-cyan-500/20'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Circular Gauge */}
              <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="72"
                    stroke="currentColor"
                    strokeWidth="14"
                    fill="transparent"
                    className="text-slate-800/80"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r="72"
                    stroke="currentColor"
                    strokeWidth="14"
                    strokeDasharray={2 * Math.PI * 72}
                    strokeDashoffset={2 * Math.PI * 72 * (1 - Math.min(1, todayCount / (dailyGoal || 1)))}
                    strokeLinecap="round"
                    fill="transparent"
                    className={`transition-all duration-700 ${
                      exceeded ? 'text-red-500' : 'text-cyan-400'
                    }`}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
                    {todayCount}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 uppercase mt-0.5">
                    {lang === 'ar' ? 'فيديو قصير' : 'Shorts'}
                  </span>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-cyan-300 font-medium">
                    <span>{progressPercent}%</span>
                    <span>{lang === 'ar' ? 'من الهدف' : 'of goal'}</span>
                  </div>
                </div>
              </div>

              {/* Stats Highlights & Time Analysis */}
              <div className="flex-1 flex flex-col gap-4 w-full">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        exceeded
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {exceeded
                        ? lang === 'ar'
                          ? '⚠️ تم تجاوز الحد اليومي!'
                          : '⚠️ Daily Limit Exceeded!'
                        : lang === 'ar'
                        ? 'مستوى المشاهدة طبيعي'
                        : 'Normal Viewing Level'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mt-1">
                    {lang === 'ar' ? 'إجمالي مشاهدات اليوم' : "Today's Total Watch"}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">{lang === 'ar' ? 'الوقت المقدر' : 'Est. Time'}</p>
                      <p className="text-base font-bold text-white">
                        {estimatedMins} {lang === 'ar' ? 'دقيقة' : 'mins'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">{lang === 'ar' ? 'الحد المسموح' : 'Daily Goal'}</p>
                      <p className="text-base font-bold text-white">
                        {dailyGoal} {lang === 'ar' ? 'فيديو' : 'videos'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Widget Quick State Switcher */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {lang === 'ar' ? 'الأيقونة العائمة (Overlay)' : 'Floating VR Widget'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {isFloatingActive
                          ? lang === 'ar'
                            ? 'ظاهرة فوق التطبيقات حالياً'
                            : 'Active over apps'
                          : lang === 'ar'
                          ? 'متوقفة حالياً'
                          : 'Currently stopped'}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFloatingActive}
                      onChange={(e) => onToggleFloating(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Apps Breakdown Section (TikTok, Reels, Shorts, etc.) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'ar' ? 'توزيع المشاهدات حسب التطبيقات' : 'Shorts Breakdown by App'}</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Room DB Live Query</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {TARGET_APPS.map((app) => {
                const count = appCounts[app.id] || 0;
                const percentage = todayCount > 0 ? Math.round((count / todayCount) * 100) : 0;

                return (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3.5 h-3.5 rounded-full shadow-sm"
                          style={{ backgroundColor: app.color }}
                        />
                        <span className="font-semibold text-sm text-white">
                          {lang === 'ar' ? app.nameAr : app.name}
                        </span>
                        <span dir="ltr" className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                          {app.packageName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-cyan-400 font-mono">{count}</span>
                        <span className="text-xs text-slate-400">({percentage}%)</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: app.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hourly Timeline Chart */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'ar' ? 'نشاط المشاهدة عبر ساعات اليوم' : "Today's Hourly Activity"}</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                {lang === 'ar' ? 'أعلى ذروة: المساء' : 'Peak: Evening'}
              </span>
            </div>

            <div className="h-28 flex items-end justify-between gap-2 pt-4 px-2">
              {hourlyData.map((d, idx) => {
                const heightPct = maxHourVal > 0 ? (d.count / maxHourVal) * 100 : 10;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="text-[10px] font-mono text-cyan-300 font-bold">{d.count}</div>
                    <div
                      className="w-full max-w-[32px] rounded-t-lg bg-gradient-to-t from-cyan-600 to-blue-400 transition-all duration-500"
                      style={{ height: `${Math.max(10, heightPct)}%` }}
                    />
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{d.hour}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Shortcuts to Code and APK Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            <button
              onClick={onOpenCodeExplorer}
              className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-800/40 hover:border-cyan-500/60 transition-all text-start flex items-center justify-between group"
            >
              <div>
                <p className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                  {lang === 'ar' ? '💻 استعراض كود أندرويد ستوديو' : '💻 Browse Android Studio Code'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'ar' ? 'Services, Manifest, Compose, Room' : 'Kotlin services, Manifest, Compose, Room'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenApkGuide}
              className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-800/40 hover:border-indigo-500/60 transition-all text-start flex items-center justify-between group"
            >
              <div>
                <p className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                  {lang === 'ar' ? '📦 خطوات تصدير وتثبيت الـ APK' : '📦 How to Build & Export APK'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'ar' ? 'توليد الـ APK وتجاوز حماية Android 13/14' : 'Build APK and Android 13/14 fixes'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </>
      ) : (
        /* Settings Tab */
        <div className="flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-4">
            <h3 className="font-bold text-white text-base">
              {lang === 'ar' ? 'إعدادات الحد اليومي والتنبيهات' : 'Daily Goal & Limit Settings'}
            </h3>

            {/* Daily Goal Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{lang === 'ar' ? 'الحد اليومي المستهدف:' : 'Daily Limit Target:'}</span>
                <span className="font-bold text-cyan-400 font-mono text-base">{dailyGoal} {lang === 'ar' ? 'فيديو' : 'shorts'}</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                step="10"
                value={dailyGoal}
                onChange={(e) => onChangeDailyGoal(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>20</span>
                <span>100</span>
                <span>200</span>
                <span>300</span>
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* VR Style Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-300">
                {lang === 'ar' ? 'شكل الأيقونة العائمة (Floating Widget Style)' : 'Floating Widget Visual Style'}
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl border border-cyan-500 bg-cyan-950/30 text-white font-medium flex items-center gap-2">
                  <Glasses className="w-4 h-4 text-cyan-400" />
                  <span>{lang === 'ar' ? 'نظارة VR سايبربنك (الافتراضي)' : 'Cyber VR Goggles (Default)'}</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/50 text-slate-400 font-medium flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'كبسولة مينيمل (Minimal Pill)' : 'Minimal Pill'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg text-white">
                {lang === 'ar' ? 'تصفير عداد اليوم؟' : "Reset Today's Counter?"}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'ar'
                  ? 'سيتم إعادة العداد إلى الصفر ومسح سجلات اليوم الحالي من قاعدة بيانات Room.'
                  : "This will reset today's counter to 0 and clear today's records in Room DB."}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onResetCount();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
              >
                {lang === 'ar' ? 'تأكيد التصفير' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
