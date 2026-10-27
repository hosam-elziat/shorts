import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Eye, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

interface PermissionsWizardProps {
  hasOverlayPermission: boolean;
  hasAccessibilityPermission: boolean;
  onToggleOverlay: () => void;
  onToggleAccessibility: () => void;
  lang: 'ar' | 'en';
}

export const PermissionsWizard: React.FC<PermissionsWizardProps> = ({
  hasOverlayPermission,
  hasAccessibilityPermission,
  onToggleOverlay,
  onToggleAccessibility,
  lang,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 p-4 sm:p-6 pb-24">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {lang === 'ar' ? 'صلاحيات النظام المطلوبة' : 'Required System Permissions'}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          {lang === 'ar'
            ? 'تجهيز الصلاحيات لضمان عمل العداد والأيقونة العائمة'
            : 'Configure Permissions for Background Counter & Floating Overlay'}
        </h2>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          {lang === 'ar'
            ? 'لكي يعمل التطبيق كما هو مطلوب، يحتاج فقط لصلاحيتين أساسيتين في الأندرويد: صلاحية النافذة العائمة لإظهار العداد، وصلاحية إمكانية الوصول لقراءة تمرير الفيديوهات.'
            : 'To operate without interruption, the app requires two key Android permissions: Overlay and Accessibility.'}
        </p>
      </div>

      {/* Permission Cards */}
      <div className="grid grid-cols-1 gap-4">
        {/* Permission 1: Overlay Window */}
        <div
          className={`p-6 rounded-3xl border transition-all ${
            hasOverlayPermission
              ? 'bg-slate-900/90 border-emerald-500/40 ring-1 ring-emerald-500/20'
              : 'bg-slate-900/70 border-slate-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  hasOverlayPermission
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-cyan-500/20 text-cyan-400'
                }`}
              >
                <Layers className="w-6 h-6" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white">
                    {lang === 'ar'
                      ? '1. الظهور فوق التطبيقات (SYSTEM_ALERT_WINDOW)'
                      : '1. Display Over Other Apps (Overlay)'}
                  </h3>
                  {hasOverlayPermission && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      {lang === 'ar' ? 'مفعلة' : 'Granted'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {lang === 'ar'
                    ? 'تسمح للأيقونة العائمة (نظارة الـ VR أو كبسولة العداد) بالظهور فوق تيك توك وإنستجرام ويوتيوب والتحرك بسلاسة أثناء تصفحك.'
                    : 'Allows the floating VR icon to remain visible on top of TikTok, Reels, and Shorts while scrolling.'}
                </p>
                <span className="text-[11px] text-cyan-400 font-mono mt-1">
                  android.permission.SYSTEM_ALERT_WINDOW
                </span>
              </div>
            </div>

            <button
              onClick={onToggleOverlay}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
                hasOverlayPermission
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
              }`}
            >
              {hasOverlayPermission
                ? lang === 'ar'
                  ? 'تم منح الصلاحية ✓'
                  : 'Granted ✓'
                : lang === 'ar'
                ? 'منح الصلاحية الآن'
                : 'Grant Permission'}
            </button>
          </div>
        </div>

        {/* Permission 2: Accessibility Service */}
        <div
          className={`p-6 rounded-3xl border transition-all ${
            hasAccessibilityPermission
              ? 'bg-slate-900/90 border-emerald-500/40 ring-1 ring-emerald-500/20'
              : 'bg-slate-900/70 border-slate-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  hasAccessibilityPermission
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-purple-500/20 text-purple-400'
                }`}
              >
                <Eye className="w-6 h-6" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white">
                    {lang === 'ar'
                      ? '2. خدمة إمكانية الوصول (Accessibility Service)'
                      : '2. Accessibility Service (Shorts Counter)'}
                  </h3>
                  {hasAccessibilityPermission && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      {lang === 'ar' ? 'مفعلة' : 'Granted'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {lang === 'ar'
                    ? 'تكتشف تلقائياً عند قيامك بتمرير الفيديو للأعلى (Swipe Up / Scroll) في تطبيقات الفيديوهات القصيرة المستهدفة لزيادة العداد بدقة دون المساس بخصوصيتك.'
                    : 'Monitors scroll/swipe events on short video feeds to detect video changes without storing any private data.'}
                </p>
                <span className="text-[11px] text-purple-400 font-mono mt-1">
                  android.permission.BIND_ACCESSIBILITY_SERVICE
                </span>
              </div>
            </div>

            <button
              onClick={onToggleAccessibility}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
                hasAccessibilityPermission
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
              }`}
            >
              {hasAccessibilityPermission
                ? lang === 'ar'
                  ? 'تم منح الصلاحية ✓'
                  : 'Granted ✓'
                : lang === 'ar'
                ? 'تفعيل الخدمة'
                : 'Enable Service'}
            </button>
          </div>
        </div>
      </div>

      {/* Foreground Service Guarantee Box */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-white">
            {lang === 'ar' ? 'خدمة Foreground Service المستمرة:' : 'Foreground Service Guarantee:'}
          </span>
          <p>
            {lang === 'ar'
              ? 'تستخدم الخدمة إشعاراً دائماً خفيفاً (Foreground Notification) مع إعدادات Android Special Use، لضمان عدم قيام نظام التشغيل (Battery Manager) بقتل التطبيق أو إغلاق العداد أثناء اللعب أو التصفح.'
              : 'Uses an ongoing foreground notification to guarantee system memory manager never terminates the floating widget.'}
          </p>
        </div>
      </div>
    </div>
  );
};
