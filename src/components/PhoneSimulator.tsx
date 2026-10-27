import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Music, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Sliders, 
  Move,
  Flame,
  CheckCircle2,
  RefreshCw,
  Eye,
  Glasses,
  Play
} from 'lucide-react';
import { TARGET_APPS, canIncrementScroll, matchAppByPackage } from '../utils/counterEngine';

interface PhoneSimulatorProps {
  currentAppId: string;
  onSelectApp: (appId: string) => void;
  todayCount: number;
  onIncrementCount: (appId: string) => void;
  isFloatingWidgetActive: boolean;
  onToggleFloatingWidget: (active: boolean) => void;
  onOpenDashboard: () => void;
  lang: 'ar' | 'en';
}

const SAMPLE_VIDEOS: Record<string, Array<{ creator: string; caption: string; likes: string; sound: string; bgGradient: string }>> = {
  tiktok: [
    { creator: '@tech_reviewer', caption: 'سماعات الواقع الافتراضي VR الجديدة تفوقت على الجميع! 🔥 #tech #vr #gadgets', likes: '1.4M', sound: 'Original Sound - Tech Beats', bgGradient: 'from-slate-900 via-purple-950 to-indigo-900' },
    { creator: '@coding_life', caption: 'كيف تبني تطبيق أندرويد متكامل بلغة Kotlin في دقائق؟ 💻📱 #android #kotlin #compose', likes: '420K', sound: 'Lo-Fi Chill Hop Vibes', bgGradient: 'from-emerald-950 via-teal-900 to-slate-900' },
    { creator: '@daily_hacks', caption: 'حيلة سرية في تيك توك هتصدمك! جربها دلوقتي 🚀', likes: '890K', sound: 'Trending Viral Sound 2026', bgGradient: 'from-rose-950 via-pink-900 to-neutral-900' },
  ],
  instagram: [
    { creator: 'instagram_reels_travel', caption: 'أجمل غروب شمس في جبال الألب 🏔️✨ #travel #reels #explore', likes: '785K', sound: 'Peaceful Ambient Echoes', bgGradient: 'from-amber-950 via-orange-900 to-stone-900' },
    { creator: 'fit_routine', caption: 'تمرين 5 دقائق للياقة البدنية الصباحية 💪🏃‍♂️ #fitness #motivation', likes: '310K', sound: 'High Energy Workout Mix', bgGradient: 'from-cyan-950 via-blue-900 to-slate-950' },
  ],
  youtube: [
    { creator: 'Shorts Science', caption: 'ماذا يحدث داخل الثقوب السوداء في الفضاء؟ 🌌🔭 #shorts #space', likes: '2.1M', sound: 'Interstellar Theme Remake', bgGradient: 'from-violet-950 via-fuchsia-950 to-neutral-950' },
    { creator: 'Android Masters', caption: 'أسرار نظام Android 14 وخدمات الخلفية الذكية ⚡', likes: '150K', sound: 'Future Wave Synth', bgGradient: 'from-sky-950 via-indigo-950 to-gray-950' },
  ],
  facebook: [
    { creator: 'Car Enthusiasts', caption: 'أسرع سيارة كهربائية لعام 2026 بتسارع خارق 🏎️⚡', likes: '64K', sound: 'V8 Hybrid Roar', bgGradient: 'from-blue-950 via-indigo-950 to-slate-900' },
  ],
  snapchat: [
    { creator: 'Snap Spotlights', caption: 'لحظات مضحكة لا تفوتك اليوم! اضغط اشتراك 😂🎉', likes: '1.2M', sound: 'Funny Comedy Beat', bgGradient: 'from-yellow-950 via-amber-900 to-zinc-900' },
  ],
};

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  currentAppId,
  onSelectApp,
  todayCount,
  onIncrementCount,
  isFloatingWidgetActive,
  onToggleFloatingWidget,
  onOpenDashboard,
  lang,
}) => {
  const [videoIndex, setVideoIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [lastScrollTime, setLastScrollTime] = useState(0);
  const [swipeFlash, setSwipeFlash] = useState(false);

  // Floating widget position inside phone screen (relative in px)
  const [widgetPos, setWidgetPos] = useState({ x: 18, y: 140 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, origX: 0, origY: 0 });
  const phoneContainerRef = useRef<HTMLDivElement>(null);

  const activeApp = TARGET_APPS.find((a) => a.id === currentAppId) || TARGET_APPS[0];
  const videos = SAMPLE_VIDEOS[currentAppId] || SAMPLE_VIDEOS.tiktok;
  const currentVideo = videos[videoIndex % videos.length];

  const triggerSwipeNext = () => {
    const now = Date.now();
    // Use debouncing logic from pure engine
    if (!canIncrementScroll(lastScrollTime, now, 600)) {
      return;
    }
    setLastScrollTime(now);
    setVideoIndex((prev) => prev + 1);
    setIsLiked(false);
    setSwipeFlash(true);
    setTimeout(() => setSwipeFlash(false), 500);

    onIncrementCount(activeApp.id);
  };

  const triggerSwipePrev = () => {
    const now = Date.now();
    if (!canIncrementScroll(lastScrollTime, now, 600)) return;
    setLastScrollTime(now);
    setVideoIndex((prev) => Math.max(0, prev - 1));
    setIsLiked(false);
    setSwipeFlash(true);
    setTimeout(() => setSwipeFlash(false), 500);

    onIncrementCount(activeApp.id);
  };

  // Drag logic for floating VR widget
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      origX: widgetPos.x,
      origY: widgetPos.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !phoneContainerRef.current) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      // Container bounds: width ~320px, height ~580px
      const newX = Math.max(10, Math.min(240, dragStartRef.current.origX + dx));
      const newY = Math.max(70, Math.min(500, dragStartRef.current.origY + dy));
      setWidgetPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      // Snap to edge like Android FloatingWidgetService
      setWidgetPos((prev) => {
        const snapX = prev.x < 130 ? 12 : 230;
        return { ...prev, x: snapX };
      });
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-xl mx-auto">
      {/* Top App Switcher Pill */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-full mb-4 shadow-xl overflow-x-auto max-w-full px-2 scrollbar-none">
        {TARGET_APPS.map((app) => {
          const isActive = app.id === currentAppId;
          return (
            <button
              key={app.id}
              onClick={() => {
                onSelectApp(app.id);
                setVideoIndex(0);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: app.color }}
              />
              <span>{lang === 'ar' ? app.nameAr : app.name}</span>
            </button>
          );
        })}
      </div>

      {/* Realistic Android Phone Device Shell */}
      <div
        ref={phoneContainerRef}
        className="relative w-[320px] h-[620px] bg-black rounded-[44px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-cyan-500/30 overflow-hidden select-none"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(6, 182, 212, 0.15)',
        }}
      >
        {/* Dynamic Island / Camera & Speaker */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-40 flex items-center justify-center gap-2 border border-slate-800">
          <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-900/50" />
        </div>

        {/* Android Screen Inner */}
        <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-slate-950 flex flex-col">
          {/* Status Bar */}
          <div className="relative z-30 flex items-center justify-between px-5 pt-3 pb-1 text-[11px] font-semibold text-white/90">
            <span>12:45</span>
            <div className="flex items-center gap-1.5 text-white/80">
              <span className="text-[10px]">5G</span>
              <div className="w-4 h-2 border border-white/80 rounded-sm p-0.5 flex items-center">
                <div className="w-full h-full bg-white rounded-xs" />
              </div>
            </div>
          </div>

          {/* Video Player Mock Content */}
          <div
            className={`relative flex-1 flex flex-col justify-between p-4 bg-gradient-to-b ${currentVideo.bgGradient} transition-colors duration-500`}
          >
            {/* Ambient Background Visual Patterns */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Top Brand Indicator */}
            <div className="relative z-20 flex items-center justify-between text-white/80 mt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: activeApp.color }}
                />
                <span>{activeApp.name}</span>
              </div>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:text-white"
                title="Sound"
                aria-label="Toggle sound"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Video Watermark and Swipe Visual Feedback */}
            <div className="relative z-20 flex flex-col items-center justify-center my-auto">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 text-white fill-white/80 ml-1" />
              </div>
              <div className="mt-3 text-center">
                <p className="text-white/60 text-xs font-medium">
                  {lang === 'ar' ? 'اسحب للأعلى أو انقر لتغيير الفيديو' : 'Swipe up to simulate next short'}
                </p>
                <div dir="ltr" className="mt-1 flex items-center justify-center gap-1 text-[11px] text-cyan-400 font-mono">
                  <span>Accessibility Hook:</span>
                  <span className="font-semibold">{activeApp.packageName.slice(0, 18)}...</span>
                </div>
              </div>
            </div>

            {/* Right Action Sidebar (Likes, Comments, Share, Music Disk) */}
            <div className="absolute right-3 bottom-14 z-20 flex flex-col items-center gap-4 text-white">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="flex flex-col items-center gap-0.5 group"
                aria-label="Like short video"
              >
                <div
                  className={`p-2.5 rounded-full bg-black/40 backdrop-blur-md transition-transform active:scale-75 ${
                    isLiked ? 'text-red-500 scale-110' : 'text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
                </div>
                <span className="text-[10px] font-bold">{currentVideo.likes}</span>
              </button>

              <div className="flex flex-col items-center gap-0.5">
                <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">4.8K</span>
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">12K</span>
              </div>

              {/* Rotating Sound Disc */}
              <div className="w-8 h-8 rounded-full bg-black/60 border-2 border-white/30 flex items-center justify-center animate-[spin_6s_linear_infinite]">
                <Music className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            </div>

            {/* Bottom Caption & Channel Info */}
            <div className="relative z-20 max-w-[210px] text-white">
              <p className="font-bold text-sm text-cyan-300 drop-shadow">{currentVideo.creator}</p>
              <p className="text-xs text-white/90 line-clamp-2 mt-0.5 leading-snug drop-shadow">
                {currentVideo.caption}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-white/70">
                <Music className="w-3 h-3 text-cyan-400" />
                <span className="truncate">{currentVideo.sound}</span>
              </div>
            </div>

            {/* Swipe Event Trigger Overlay Effect */}
            {swipeFlash && (
              <div className="absolute inset-0 bg-cyan-400/20 backdrop-blur-xs z-30 pointer-events-none flex items-center justify-center animate-out fade-out duration-300">
                <div className="bg-black/80 px-4 py-2 rounded-full border border-cyan-400/60 text-cyan-300 text-xs font-mono font-bold flex items-center gap-2 shadow-2xl">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span>+1 Video Watched</span>
                </div>
              </div>
            )}
          </div>

          {/* FLOATING VR-LIKE WIDGET OVERLAY (SYSTEM_ALERT_WINDOW SIMULATION) */}
          {isFloatingWidgetActive && (
            <div
              style={{
                position: 'absolute',
                left: `${widgetPos.x}px`,
                top: `${widgetPos.y}px`,
                zIndex: 50,
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
              onMouseDown={handleMouseDown}
              className="group select-none"
            >
              <div
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/90 border border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.4)] backdrop-blur-md transition-transform duration-150 ${
                  swipeFlash ? 'scale-115 ring-2 ring-cyan-300' : 'hover:scale-105'
                }`}
              >
                {/* VR Headset Icon */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-inner">
                  <Glasses className="w-3.5 h-3.5 text-white" />
                </div>

                {/* Live Counter Value */}
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="font-extrabold text-white text-sm tracking-tight font-mono">
                      {todayCount}
                    </span>
                    <span className="text-[9px] text-cyan-400 font-semibold uppercase">
                      {lang === 'ar' ? 'فيديو' : 'shorts'}
                    </span>
                  </div>
                </div>

                {/* Quick Expand Button to Dashboard */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDashboard();
                  }}
                  className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-[10px] ml-0.5"
                  title="Open Dashboard"
                  aria-label="Open stats dashboard"
                >
                  ↗
                </button>
              </div>

              {/* Drag indicator tooltip when hovered */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] text-cyan-300 whitespace-nowrap bg-black/80 px-1.5 py-0.5 rounded pointer-events-none">
                {lang === 'ar' ? 'اسحب للتحريك • انقر للداشبورد' : 'Drag to move • Click ↗ for stats'}
              </div>
            </div>
          )}

          {/* Android Bottom Navigation Bar */}
          <div className="relative z-30 py-2 flex justify-center bg-black/60">
            <div className="w-24 h-1 bg-white/40 rounded-full" />
          </div>
        </div>
      </div>

      {/* Simulator Quick Controls & Gestures Bar */}
      <div className="mt-5 w-full flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 border border-slate-800/80 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={triggerSwipeNext}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <span>{lang === 'ar' ? 'تمرير للأعلى (سحب فيديو جديد)' : 'Swipe Next Video (+1)'}</span>
            <span className="text-sm">↑</span>
          </button>

          <button
            onClick={triggerSwipePrev}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold active:scale-95 transition-all"
            title="Previous Short"
          >
            <span>↓</span>
          </button>
        </div>

        {/* Toggle Floating VR Widget */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
            <span>{lang === 'ar' ? 'الأيقونة العائمة (VR):' : 'Floating VR Widget:'}</span>
            <input
              type="checkbox"
              checked={isFloatingWidgetActive}
              onChange={(e) => onToggleFloatingWidget(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700 focus:ring-cyan-500"
            />
          </label>

          <button
            onClick={onOpenDashboard}
            className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 hover:bg-cyan-900/60 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'فتح الـ Compose UI' : 'Open Dashboard'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
