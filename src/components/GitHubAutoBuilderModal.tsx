import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Github, 
  Zap, 
  CheckCircle2, 
  ExternalLink, 
  Download, 
  RotateCcw, 
  AlertCircle, 
  Play, 
  Layers, 
  Check, 
  Loader2, 
  ShieldCheck, 
  ArrowRight,
  Terminal,
  KeyRound,
  FolderGit2
} from 'lucide-react';
import { 
  verifyGitHubToken, 
  createRepoAndUploadProject, 
  fetchLatestWorkflowRun, 
  fetchRunArtifacts, 
  GitHubUser, 
  WorkflowRunStatus, 
  ArtifactInfo 
} from '../utils/githubDeployer';

interface GitHubAutoBuilderModalProps {
  onClose?: () => void;
  lang: 'ar' | 'en';
}

export const GitHubAutoBuilderModal: React.FC<GitHubAutoBuilderModalProps> = ({ onClose, lang }) => {
  const [token, setToken] = useState<string>('');
  const [repoName, setRepoName] = useState<string>('ShortsCounter');
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Active build status
  const [repoInfo, setRepoInfo] = useState<{ owner: string; repo: string; repoUrl: string } | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowRunStatus | null>(null);
  const [artifacts, setArtifacts] = useState<ArtifactInfo[]>([]);
  const [pollingTimer, setPollingTimer] = useState<number>(0);

  // Quick verify when token changes
  const handleVerifyToken = async (tokenToTest: string) => {
    if (!tokenToTest || tokenToTest.length < 15) return;
    setIsLoadingUser(true);
    setError(null);
    try {
      const u = await verifyGitHubToken(tokenToTest);
      setUser(u);
    } catch (e: any) {
      setError(e.message);
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  };

  // Start automated deploy and build
  const handleStartDeploy = async () => {
    if (!token) {
      setError(lang === 'ar' ? 'الرجاء إدخال توكن GitHub أولاً' : 'Please provide a GitHub Personal Access Token');
      return;
    }

    setIsDeploying(true);
    setError(null);
    setCurrentStep(1);

    try {
      const result = await createRepoAndUploadProject(token, repoName, (msg, step) => {
        setStatusMessage(msg);
        setCurrentStep(step);
      });

      setRepoInfo(result);
      setStatusMessage(
        lang === 'ar'
          ? 'تم رفع المشروع بنجاح! خوادم GitHub Actions بدأت بناء الـ APK الآن في السحابة ⚡'
          : 'Repository created & workflow started on GitHub Actions!'
      );
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'حدث خطأ أثناء الاتصال بـ GitHub');
      setIsDeploying(false);
    }
  };

  // Polling GitHub Actions status
  useEffect(() => {
    if (!repoInfo || !token) return;

    let intervalId: any = null;

    const poll = async () => {
      try {
        const run = await fetchLatestWorkflowRun(token, repoInfo.owner, repoInfo.repo);
        if (run) {
          setWorkflowStatus(run);
          if (run.conclusion === 'success') {
            const arts = await fetchRunArtifacts(token, repoInfo.owner, repoInfo.repo, run.id);
            setArtifacts(arts);
            setIsDeploying(false);
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
            clearInterval(intervalId);
          } else if (run.conclusion === 'failure') {
            setIsDeploying(false);
            setError(lang === 'ar' ? 'فشلت عملية البناء على GitHub. تفقد سجلات الأخطاء.' : 'Workflow failed on GitHub.');
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    };

    // Initial check
    poll();
    intervalId = setInterval(() => {
      setPollingTimer((t) => t + 5);
      poll();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [repoInfo, token, lang]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-4 sm:p-6 pb-24">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 flex flex-col gap-3 shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'البناء السحابي التلقائي 1-Click' : '1-Click Cloud APK Generator'}</span>
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {lang === 'ar'
            ? 'الربط المباشر مع GitHub وبناء ملف الـ APK تلقائياً'
            : 'Connect with GitHub & Auto-Build APK Directly'}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          {lang === 'ar'
            ? 'لا تحتاج لكتابة أي أوامر ولا فتح أندرويد ستوديو. أدخل توكن حسابك على GitHub، وسيقوم النظام بإنشاء المستودع، ورفع الكود، وتشغيل سيرفرات GitHub Actions في السحابة وتوليد الـ APK لك فوراً.'
            : 'Provide your GitHub token. The system creates the repo, pushes files, triggers Actions, and delivers your APK.'}
        </p>
      </div>

      {/* Main Connection Form & Wizard */}
      {!repoInfo ? (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col gap-5 shadow-xl">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'ar' ? 'توكن حسابك على GitHub (Personal Access Token):' : 'GitHub Personal Access Token:'}</span>
              </span>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=ShortsCounterApp"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline"
              >
                <span>{lang === 'ar' ? 'اضغط هنا لإنشاء التوكن في 10 ثوانٍ' : 'Generate token in 10s'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>

            <div className="relative">
              <input
                type="password"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  handleVerifyToken(e.target.value);
                }}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white font-mono text-xs sm:text-sm outline-none"
              />
              {isLoadingUser && (
                <div className="absolute right-3 top-3">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              {lang === 'ar'
                ? 'التوكن يحتاج فقط لصلاحيتي (repo و workflow) لكي يستطيع خادم السحابة إنشاء المستودع وبناء الـ APK.'
                : 'Token requires (repo & workflow) scopes to create the repository and trigger the build.'}
            </p>
          </div>

          {/* User Preview If Verified */}
          {user && (
            <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-9 h-9 rounded-full border border-cyan-400"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm">{user.name}</span>
                    <span className="text-xs text-cyan-300 font-mono">(@{user.login})</span>
                  </div>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'تم التحقق من الحساب بنجاح' : 'Account verified'}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Repo Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'ar' ? 'اسم المستودع (Repository Name):' : 'Repository Name:'}</span>
            </label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="w-full max-w-sm px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs outline-none focus:border-cyan-500"
            />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleStartDeploy}
            disabled={isDeploying || !token}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{statusMessage || (lang === 'ar' ? 'جاري الاتصال والإنشاء...' : 'Creating & Deploying...')}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>{lang === 'ar' ? '🚀 اربط مع GitHub وابدأ بناء الـ APK فوراً' : '🚀 Connect & Auto-Build APK Now'}</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Active Cloud Build Monitor */
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col gap-5 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400">
                <Github className="w-6 h-6" />
              </div>
              <div>
                <a
                  href={repoInfo.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-white text-base hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                >
                  <span>{repoInfo.owner} / {repoInfo.repo}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
                <p className="text-xs text-slate-400 font-mono">
                  {lang === 'ar' ? 'تم رفع المشروع بنجاح على حسابك' : 'Pushed to your GitHub successfully'}
                </p>
              </div>
            </div>

            <a
              href={`${repoInfo.repoUrl}/actions`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>{lang === 'ar' ? 'عرض على GitHub' : 'View on GitHub'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Workflow Status Box */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {workflowStatus?.conclusion === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                )}
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {workflowStatus?.conclusion === 'success'
                      ? lang === 'ar'
                        ? 'اكتمل بناء ملف الـ APK بنجاح! 🎉'
                        : 'APK Build Succeeded! 🎉'
                      : lang === 'ar'
                      ? 'خادم GitHub Actions يبني الـ APK الآن في السحابة...'
                      : 'GitHub Actions is compiling your APK in the cloud...'}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Task: Gradle assembleDebug (Android SDK 34 • Kotlin Compose)
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono text-cyan-400 px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-800/50">
                {pollingTimer}s
              </span>
            </div>

            {/* Progress status bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${
                  workflowStatus?.conclusion === 'success'
                    ? 'w-full bg-emerald-500'
                    : 'w-2/3 bg-cyan-500 animate-pulse'
                }`}
              />
            </div>
          </div>

          {/* Generated APK Download Section */}
          {workflowStatus?.conclusion === 'success' && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/50 flex flex-col gap-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {lang === 'ar' ? 'ملف الـ APK جاهز للتحميل والتثبيت!' : 'Your APK is ready to install!'}
                    </h4>
                    <p className="text-xs text-slate-300">
                      ShortsCounter-Debug-APK (app-debug.apk)
                    </p>
                  </div>
                </div>

                <a
                  href={`${repoInfo.repoUrl}/actions`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تحميل الـ APK الآن' : 'Download APK'}</span>
                </a>
              </div>

              <p className="text-[11px] text-slate-400">
                {lang === 'ar'
                  ? 'اضغط على زر التحميل، ثم انزل لقسم Artifacts في صفحة GitHub واضغط على ShortsCounter-Debug-APK.'
                  : 'Click the button, then under Artifacts on GitHub, click ShortsCounter-Debug-APK.'}
              </p>
            </div>
          )}

          {/* Reset / Build Again Button */}
          <div className="flex justify-start">
            <button
              onClick={() => {
                setRepoInfo(null);
                setWorkflowStatus(null);
                setArtifacts([]);
                setPollingTimer(0);
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'إعادة البناء أو تغيير الإعدادات' : 'Build again or change settings'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
