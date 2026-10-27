import React, { useState } from 'react';
import { 
  FileCode2, 
  Copy, 
  Check, 
  Download, 
  FolderTree, 
  ExternalLink, 
  Sparkles,
  Layers,
  Terminal,
  FileText
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, CodeFile } from '../data/androidProjectFiles';
import { downloadAndroidProjectZip } from '../utils/zipExporter';

interface CodeExplorerProps {
  lang: 'ar' | 'en';
}

export const CodeExplorer: React.FC<CodeExplorerProps> = ({ lang }) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(ANDROID_PROJECT_FILES[0].path);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const selectedFile = ANDROID_PROJECT_FILES.find((f) => f.path === selectedFilePath) || ANDROID_PROJECT_FILES[0];

  const categories = [
    { id: 'all', nameAr: 'كل الملفات', nameEn: 'All Files' },
    { id: 'services', nameAr: 'خدمات الخلفية (Services)', nameEn: 'Services' },
    { id: 'manifest', nameAr: 'المانيفيست (Manifest)', nameEn: 'Manifest' },
    { id: 'database', nameAr: 'قاعدة البيانات (Room)', nameEn: 'Database' },
    { id: 'ui', nameAr: 'واجهات (Jetpack Compose)', nameEn: 'Compose UI' },
    { id: 'gradle', nameAr: 'إعدادات البناء (Gradle)', nameEn: 'Gradle' },
    { id: 'res', nameAr: 'الموارد والتعريب (Res/XML)', nameEn: 'Resources' },
  ];

  const filteredFiles = selectedCategory === 'all'
    ? ANDROID_PROJECT_FILES
    : ANDROID_PROJECT_FILES.filter((f) => f.category === selectedCategory);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExportingZip(true);
      setExportProgress(10);
      await downloadAndroidProjectZip((p) => setExportProgress(Math.round(p)));
      setTimeout(() => {
        setIsExportingZip(false);
        setExportProgress(0);
      }, 1000);
    } catch (err) {
      console.error('Failed to export zip', err);
      setIsExportingZip(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5 p-4 sm:p-6 pb-24">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Android 14 Ready • Jetpack Compose
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            {lang === 'ar' ? 'مستودع الكود المصدري الكامل لتطبيق أندرويد' : 'Android Project Source Code'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {lang === 'ar'
              ? 'كافة ملفات لغة Kotlin و XML و Gradle المصممة هندسياً للعمل مع خدمات إمكانية الوصول والأيقونة العائمة وقاعدة بيانات Room.'
              : 'Complete production-grade Kotlin, XML and Gradle scripts ready to import into Android Studio.'}
          </p>
        </div>

        {/* Download Full Project ZIP */}
        <button
          onClick={handleDownloadZip}
          disabled={isExportingZip}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/25 active:scale-95 transition-all shrink-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>
            {isExportingZip
              ? lang === 'ar'
                ? `جاري التحزيم... ${exportProgress}%`
                : `Zipping... ${exportProgress}%`
              : lang === 'ar'
              ? 'تحميل مشروع أندرويد ستوديو (.ZIP)'
              : 'Download Android Studio (.ZIP)'}
          </span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {lang === 'ar' ? cat.nameAr : cat.nameEn}
            </button>
          );
        })}
      </div>

      {/* Code Viewer Grid (Sidebar File Tree + Code Editor) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        {/* Left File Tree Selector */}
        <div className="lg:col-span-4 p-3 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col gap-1.5 max-h-[550px] overflow-y-auto">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <FolderTree className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'ar' ? 'هيكل المشروع (Project Tree)' : 'Project Files'}</span>
          </div>

          {filteredFiles.map((file) => {
            const isSelected = file.path === selectedFilePath;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFilePath(file.path)}
                className={`p-3 rounded-xl text-start flex flex-col gap-1 transition-all ${
                  isSelected
                    ? 'bg-cyan-950/60 border border-cyan-500/50 text-white shadow-lg shadow-cyan-950/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold truncate">
                    <FileCode2
                      className={`w-4 h-4 shrink-0 ${
                        file.language === 'kotlin'
                          ? 'text-purple-400'
                          : file.language === 'xml'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                    {file.language}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">
                  {lang === 'ar' ? file.descriptionAr : file.descriptionEn}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Code Display */}
        <div className="lg:col-span-8 flex flex-col min-h-[480px] bg-slate-950">
          {/* Code Header Bar */}
          <div className="flex items-center justify-between p-3.5 bg-slate-900/90 border-b border-slate-800">
            <div className="flex flex-col">
              <span className="font-mono text-xs text-cyan-300 font-bold">{selectedFile.path}</span>
              <span className="text-[11px] text-slate-400">
                {lang === 'ar' ? selectedFile.descriptionAr : selectedFile.descriptionEn}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : lang === 'ar' ? 'نسخ الكود' : 'Copy'}</span>
            </button>
          </div>

          {/* Code Block with line numbering */}
          <div dir="ltr" className="p-4 font-mono text-xs overflow-x-auto max-h-[550px] overflow-y-auto text-slate-300 leading-relaxed text-left scrollbar-thin">
            <pre className="text-slate-300 text-left">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
