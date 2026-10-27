import React, { useState } from 'react';
import { 
  Package, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldAlert, 
  Cpu, 
  Smartphone, 
  Layers, 
  FolderCheck,
  HelpCircle,
  ExternalLink,
  Cloud,
  Github,
  Zap,
  Download,
  Flame,
  ArrowRight,
  PlayCircle,
  Clock,
  Sparkles,
  MousePointerClick
} from 'lucide-react';
import { APK_BUILD_TUTORIAL } from '../data/androidProjectFiles';

interface ApkGuideModalProps {
  onClose?: () => void;
  lang: 'ar' | 'en';
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({ onClose, lang }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeStepTab, setActiveStepTab] = useState<number>(1);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const stepsDetails = [
    {
      num: 1,
      titleAr: 'الخطوة 1: تنزيل ملفات المشروع من هنا',
      titleEn: 'Step 1: Download Project ZIP',
      descAr: 'اضغط على زر "تحميل مشروع أندرويد (.ZIP)" من الشريط العلوي. فك الضغط عن الملف في جهازك أو هاتفك. ستجد داخله مجلد خفي اسمه .github يحتوي على أمر البناء التلقائي.',
      descEn: 'Click the Download (.ZIP) button above and extract the files.',
      visualBadge: 'Download ZIP'
    },
    {
      num: 2,
      titleAr: 'الخطوة 2: إنشاء مستودع جديد على GitHub ورفع الملفات',
      titleEn: 'Step 2: Create GitHub Repo & Upload',
      descAr: 'افتح GitHub.com واضغط على (+) أعلى اليمين واختر "New repository". سمّه مثلاً ShortsCounter واجعله Public. بعد الإنشاء اضغط على رابط "uploading an existing file" واسحب كل الملفات واضغط الزر الأخضر "Commit changes".',
      descEn: 'Create a new repo on GitHub.com and upload the unzipped project files, then Commit.',
      visualBadge: 'Upload & Commit'
    },
    {
      num: 3,
      titleAr: 'الخطوة 3: تشغيل الرن (Run Workflow)',
      titleEn: 'Step 3: Trigger Run Workflow',
      descAr: 'اضغط على تبويب "Actions" في الشريط العلوي للمستودع. ستجد أن الرن بدأ يعمل أوتوماتيكياً! وإذا أردت تشغيله يدوياً بأي وقت: اضغط على "Build ShortsCounter APK" من القائمة اليسرى ثم اضغط الزر الأزرق "Run workflow" > "Run workflow".',
      descEn: 'Go to the "Actions" tab. The workflow runs automatically, or click "Run workflow" manually.',
      visualBadge: 'Actions > Run workflow'
    },
    {
      num: 4,
      titleAr: 'الخطوة 4: تحميل ملف الـ APK وتثبيته على الهاتف',
      titleEn: 'Step 4: Download the APK from Artifacts',
      descAr: 'انتظر حوالي دقيقة ونصف حتى تظهر علامة الصح الخضراء ✓. اضغط على اسم العملية، وانزل لأسفل الصفحة عند قسم "Artifacts"، اضغط على "ShortsCounter-Debug-APK" وسيتم تحميل الـ APK فوراً لجهازك!',
      descEn: 'Wait for green checkmark ✓. Scroll to "Artifacts" at bottom and download ShortsCounter-Debug-APK!',
      visualBadge: 'Artifacts > Download APK'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-4 sm:p-6 pb-24">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
            <Github className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'بناء سحابي مباشر ومجاني 100%' : '100% Free Cloud Build'}</span>
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white">
          {lang === 'ar'
            ? 'خطوات عمل "Run" على GitHub والحصول على ملف الـ APK مباشرة'
            : 'How to Run Workflow on GitHub & Download APK Directly'}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          {lang === 'ar'
            ? 'خوادم GitHub المجانية تمتلك نظام لينكس كامل وأحدث حزم أندرويد SDK وجافا. كل ما عليك هو رفع الملفات والضغط على زر التشغيل وسيتولى الخادم تجميع ملف app-debug.apk وتقديمه لك جاهزاً للتثبيت في 90 ثانية فقط!'
            : 'GitHub cloud runners compile your Kotlin app and package the APK for free in ~90 seconds.'}
        </p>
      </div>

      {/* Interactive Step Switcher Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stepsDetails.map((st) => (
          <button
            key={st.num}
            onClick={() => setActiveStepTab(st.num)}
            className={`p-3 rounded-2xl border text-start transition-all flex flex-col gap-1 ${
              activeStepTab === st.num
                ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-lg shadow-cyan-950/50'
                : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                activeStepTab === st.num ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {st.num}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-cyan-300">
                {st.visualBadge}
              </span>
            </div>
            <span className="font-semibold text-xs mt-1 truncate">
              {lang === 'ar' ? st.titleAr : st.titleEn}
            </span>
          </button>
        ))}
      </div>

      {/* Visual Simulation Card for the selected step */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col gap-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-lg shrink-0">
              {activeStepTab}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {lang === 'ar' ? stepsDetails[activeStepTab - 1].titleAr : stepsDetails[activeStepTab - 1].titleEn}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                {lang === 'ar' ? stepsDetails[activeStepTab - 1].descAr : stepsDetails[activeStepTab - 1].descEn}
              </p>
            </div>
          </div>
        </div>

        {/* Visual Mock of GitHub Interface corresponding to active step */}
        {activeStepTab === 1 && (
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/20">
              <Download className="w-7 h-7 text-white" />
            </div>
            <p className="text-sm font-bold text-white">
              {lang === 'ar' ? 'الملفات مجهزة بداخلها كود GitHub Actions التلقائي' : 'All files ready with pre-configured GitHub Actions'}
            </p>
            <p className="text-xs text-slate-400 max-w-md">
              {lang === 'ar'
                ? 'الملف السحري اسمه .github/workflows/build-apk.yml وموجود مسبقاً داخل الـ ZIP بدون أي تعديل منك.'
                : 'Contains .github/workflows/build-apk.yml ready to compile your app on the cloud.'}
            </p>
          </div>
        )}

        {activeStepTab === 2 && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3 font-mono text-xs">
            {/* Mock GitHub Repo Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-white" />
                <span className="text-cyan-400 font-bold">your-username</span>
                <span>/</span>
                <span className="text-white font-bold">ShortsCounter</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300">Public</span>
              </div>
            </div>
            {/* Mock Upload Bar */}
            <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-center gap-2 bg-slate-900/30">
              <div className="p-3 rounded-full bg-slate-800 text-slate-300">
                <Layers className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-slate-200 font-semibold text-xs">
                {lang === 'ar' ? 'اسحب مجلد المشروع المفكوك هنا في صفحة Upload Files' : 'Drag unzipped project folder here in Upload Files'}
              </p>
              <span className="text-[11px] text-slate-500">app/, gradle/, .github/, build.gradle.kts...</span>
            </div>
            <div className="flex justify-end">
              <div className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow">
                <Check className="w-4 h-4" />
                <span>Commit changes</span>
              </div>
            </div>
          </div>
        )}

        {activeStepTab === 3 && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3 font-mono text-xs">
            {/* Mock GitHub Navigation Bar */}
            <div className="flex items-center gap-4 pb-3 border-b border-slate-800 text-slate-400 overflow-x-auto text-xs">
              <span className="text-slate-400">Code</span>
              <span className="text-slate-400">Issues</span>
              <span className="text-slate-400">Pull requests</span>
              <span className="text-white font-bold border-b-2 border-cyan-400 pb-1 flex items-center gap-1">
                <PlayCircle className="w-3.5 h-3.5 text-cyan-400" />
                Actions
              </span>
            </div>

            {/* Actions Trigger Mock */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                <div>
                  <p className="font-bold text-white text-xs">Build ShortsCounter APK</p>
                  <p className="text-[11px] text-slate-400">.github/workflows/build-apk.yml</p>
                </div>
              </div>

              {/* Blue Run Workflow Button */}
              <div className="flex items-center gap-2">
                <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/20 ring-2 ring-blue-400/50 animate-pulse">
                  <PlayCircle className="w-4 h-4" />
                  <span>Run workflow ▼</span>
                </div>
              </div>
            </div>

            {/* Live Progress Box */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-spin" />
                <span>Build Android APK (Running Gradle assembleDebug in Ubuntu container...)</span>
              </div>
              <span className="text-slate-400 text-[11px]">~1m 20s</span>
            </div>
          </div>
        )}

        {activeStepTab === 4 && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3 font-mono text-xs">
            {/* Completed Workflow Run */}
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="font-bold text-white text-xs">Build Android APK - #1</p>
                  <p className="text-[11px] text-emerald-400">Success in 1m 24s</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Completed
              </span>
            </div>

            {/* Artifacts Download Section Mock */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                <span>Artifacts (1)</span>
                <span>Size ~ 8.4 MB</span>
              </div>

              {/* The Download Button */}
              <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/50 hover:border-cyan-400 transition-all flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs">
                  <Package className="w-5 h-5 text-cyan-400" />
                  <div>
                    <span className="text-white font-bold select-all">ShortsCounter-Debug-APK</span>
                    <p className="text-[10px] text-slate-400">Contains app-debug.apk</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-md shadow-cyan-500/20 cursor-pointer">
                  <Download className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تحميل APK' : 'Download'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={() => setActiveStepTab((p) => Math.max(1, p - 1))}
            disabled={activeStepTab === 1}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none"
          >
            {lang === 'ar' ? '← الخطوة السابقة' : '← Previous Step'}
          </button>

          <span className="text-xs text-slate-400 font-mono">
            {activeStepTab} / {stepsDetails.length}
          </span>

          <button
            onClick={() => setActiveStepTab((p) => Math.min(stepsDetails.length, p + 1))}
            disabled={activeStepTab === stepsDetails.length}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none"
          >
            {lang === 'ar' ? 'الخطوة التالية →' : 'Next Step →'}
          </button>
        </div>
      </div>

      {/* Alternative 2: Codespaces (Instant Terminal In Browser) */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h4 className="font-bold text-white text-sm">
            {lang === 'ar' ? 'طريقة أخرى بدون انتظار: عبر GitHub Codespaces' : 'Alternative: Run via GitHub Codespaces'}
          </h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {lang === 'ar'
            ? 'في مستودعك اضغط على زر `< > Code` ثم اختر `Codespaces` > `Create codespace on main`. سيفتح لك محرر أونلاين في المتصفح. فقط انسخ هذا الأمر والصقه في شاشة التيرمنال بالأسفل:'
            : 'In your repo tap `< > Code` > `Codespaces` > `Create codespace`. In the web terminal, paste this command:'}
        </p>

        <div dir="ltr" className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 text-left">
          <div className="flex items-center gap-2 overflow-x-auto text-left">
            <Terminal className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="font-semibold select-all text-left">./gradlew assembleDebug</span>
          </div>
          <button
            onClick={() => copyToClipboard('./gradlew assembleDebug')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0 ml-2"
            title="Copy command"
            aria-label="Copy terminal command"
          >
            {copiedCmd === './gradlew assembleDebug' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <p className="text-xs text-slate-400">
          {lang === 'ar'
            ? 'بعد انتهاء الأمر، ستجد ملف الـ APK في مجلد app/build/outputs/apk/debug/app-debug.apk، اضغط عليه كليك يمين ثم Download.'
            : 'Right click app-debug.apk under app/build/outputs/apk/debug/ and select Download.'}
        </p>
      </div>

      {/* Critical Android 13 & 14 Reminder */}
      <div className="p-6 rounded-3xl bg-amber-950/30 border border-amber-500/40 flex flex-col sm:flex-row items-start gap-4 shadow-xl">
        <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="flex flex-col gap-1.5 text-xs sm:text-sm leading-relaxed">
          <h4 className="font-bold text-base text-amber-300">
            {lang === 'ar'
              ? 'تذكير مهم عند تثبيت الـ APK على هاتفك (أندرويد 13 و 14):'
              : 'Important note when installing APK on Android 13/14:'}
          </h4>
          <p className="text-slate-300">
            {lang === 'ar'
              ? 'إذا وجدت خيار Accessibility مقفولاً ومكتوب عليه (Restricted setting): اذهب إلى إعدادات الهاتف > التطبيقات > ShortsCounter > اضغط على الثلاث نقاط (⋮) في الأعلى واختر "السماح بالإعدادات المقيدة (Allow restricted settings)".'
              : 'If Accessibility is grayed out: Phone Settings > Apps > ShortsCounter > Tap (⋮) top right > "Allow restricted settings".'}
          </p>
        </div>
      </div>
    </div>
  );
};
