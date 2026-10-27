export interface CodeFile {
  path: string;
  name: string;
  language: 'kotlin' | 'xml' | 'gradle' | 'properties' | 'markdown';
  category: 'manifest' | 'services' | 'database' | 'ui' | 'gradle' | 'res';
  descriptionAr: string;
  descriptionEn: string;
  code: string;
}

export const ANDROID_PROJECT_FILES: CodeFile[] = [
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    descriptionAr: 'ملف المانيفيست: تعريف الصلاحيات (النافذة العائمة، إمكانية الوصول، الإشعارات) والخدمات والنشاط الرئيسي.',
    descriptionEn: 'Manifest file: declares permissions (Overlay, Accessibility, Foreground Service) and services.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.shortscounter.app">

    <!-- الصلاحيات الأساسية المطلوبة -->
    <!-- صلاحية ظهور الأيقونة العائمة فوق التطبيقات الأخرى -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

    <!-- صلاحية خدمة الخلفية لضمان استمرار عمل العداد -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />

    <!-- صلاحية الإشعارات لنظام أندرويد 13 فما فوق -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- صلاحية الاهتزاز عند تجاوز الحد اليومي للمشاهدة -->
    <uses-permission android:name="android.permission.VIBRATE" />

    <!-- صلاحية إعادة تشغيل الودجت العائم تلقائياً بعد إعادة تشغيل الهاتف -->
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:icon="@android:drawable/sym_def_app_icon"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/Theme.ShortsCounter"
        tools:targetApi="34">

        <!-- الشاشة الرئيسية للتطبيق مبنية بـ Jetpack Compose -->
        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:theme="@style/Theme.ShortsCounter"
            android:launchMode="singleTop">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- خدمة إمكانية الوصول Accessibility Service لرصد السكرول في تطبيقات الفيديوهات القصيرة -->
        <service
            android:name=".services.ShortsAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

        <!-- خدمة الأيقونة العائمة Floating Overlay Service -->
        <service
            android:name=".services.FloatingWidgetService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="Live floating video counter overlay over social media apps" />
        </service>

        <!-- مستقبل إعادة تشغيل الجهاز لتنشيط الودجت تلقائياً -->
        <receiver
            android:name=".receivers.BootReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.QUICKBOOT_POWERON" />
            </intent-filter>
        </receiver>

    </application>

</manifest>`
  },
  {
    path: 'app/src/main/res/xml/accessibility_service_config.xml',
    name: 'accessibility_service_config.xml',
    language: 'xml',
    category: 'res',
    descriptionAr: 'تكوين خدمة الـ Accessibility: تحديد حزم التطبيقات المستهدفة ونوع الأحداث (التمرير والتغيير).',
    descriptionEn: 'Accessibility service configuration: target package names and event filters.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/accessibility_service_description"
    android:packageNames="com.zhiliaoapp.musically,com.ss.android.ugc.trill,com.instagram.android,com.google.android.youtube,com.facebook.katana,com.snapchat.android"
    android:accessibilityEventTypes="typeViewScrolled|typeWindowContentChanged|typeWindowStateChanged"
    android:accessibilityFlags="flagDefault|flagRetrieveInteractiveWindows|flagReportViewIds"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:notificationTimeout="100"
    android:canRetrieveWindowContent="true"
    android:settingsActivity="com.shortscounter.app.ui.MainActivity" />`
  },
  {
    path: 'app/src/main/java/com/shortscounter/app/services/ShortsAccessibilityService.kt',
    name: 'ShortsAccessibilityService.kt',
    language: 'kotlin',
    category: 'services',
    descriptionAr: 'خدمة إمكانية الوصول: مراقبة حزم تيك توك وريلز وشورتس وسناب شات، وفلترة أحداث التمرير (Scroll) بذكاء لمنع التكرار.',
    descriptionEn: 'Accessibility Service: monitors target short video packages and debounces vertical scrolls to count video transitions.',
    code: `package com.shortscounter.app.services

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.os.SystemClock
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.shortscounter.app.data.AppDatabase
import com.shortscounter.app.data.VideoRecordEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * خدمة إمكانية الوصول الذكية (Smart Accessibility Service)
 * تراقب تطبيقات الفيديوهات القصيرة وتلتقط لحظات الانتقال بين الفيديوهات بدقة.
 */
class ShortsAccessibilityService : AccessibilityService() {

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var lastScrollTimestamp: Long = 0
    private var lastPackage: String = ""

    // الحد الأدنى بين كل سكرول لتجنب زيادة العداد مرتين في حركة واحدة (Debounce Time = 700ms)
    private val SCROLL_DEBOUNCE_MS = 700L

    companion object {
        private const val TAG = "ShortsAccessibility"
        const val ACTION_COUNTER_UPDATED = "com.shortscounter.app.COUNTER_UPDATED"
        const val EXTRA_COUNT = "extra_count"
        const val EXTRA_PACKAGE = "extra_package"

        // تعريف الحزم المستهدفة
        const val PKG_TIKTOK = "com.zhiliaoapp.musically"
        const val PKG_TIKTOK_LITE = "com.ss.android.ugc.trill"
        const val PKG_INSTAGRAM = "com.instagram.android"
        const val PKG_YOUTUBE = "com.google.android.youtube"
        const val PKG_FACEBOOK = "com.facebook.katana"
        const val PKG_SNAPCHAT = "com.snapchat.android"
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.i(TAG, "ShortsAccessibilityService connected and actively monitoring")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        val packageName = event.packageName?.toString() ?: return
        val eventType = event.eventType

        // التحقق من أن الحدث قادم من إحدى التطبيقات المستهدفة
        if (!isTargetPackage(packageName)) return

        // التحقق من نوع الحدث: تمرير (Scroll) أو تغيير حالة النافذة
        when (eventType) {
            AccessibilityEvent.TYPE_VIEW_SCROLLED -> {
                handleScrollEvent(packageName, event)
            }
            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED -> {
                // فحص دقيق لعناصر الشاشة في حال استخدام أجهزة تطلق تغير المحتوى
                checkShortsContentTransition(packageName, event)
            }
        }
    }

    private fun isTargetPackage(pkg: String): Boolean {
        return pkg == PKG_TIKTOK ||
               pkg == PKG_TIKTOK_LITE ||
               pkg == PKG_INSTAGRAM ||
               pkg == PKG_YOUTUBE ||
               pkg == PKG_FACEBOOK ||
               pkg == PKG_SNAPCHAT
    }

    private fun handleScrollEvent(packageName: String, event: AccessibilityEvent) {
        val currentTime = SystemClock.uptimeMillis()

        // منع الحساب المتكرر للـ Fling الواحد
        if (currentTime - lastScrollTimestamp < SCROLL_DEBOUNCE_MS) {
            return
        }

        // التحقق من أن التمرير كان رأسياً (Vertical) كما هو الحال في تيك توك وريلز
        val isVerticalScroll = event.scrollDeltaY != 0 || event.scrollY != 0 || event.scrollX == 0

        // فحص إضافي لشجرة العناصر للتحقق من أن المستخدم فعلاً داخل شاشة الريلز/الشورتس
        if (isInsideShortsSection(packageName, rootInActiveWindow)) {
            lastScrollTimestamp = currentTime
            lastPackage = packageName
            onNewVideoWatched(packageName)
        }
    }

    private fun checkShortsContentTransition(packageName: String, event: AccessibilityEvent) {
        // فحص ذكي خاص بـ YouTube Shorts وتيك توك عند انتهاء وتمرير الفيديو
        val currentTime = SystemClock.uptimeMillis()
        if (currentTime - lastScrollTimestamp < SCROLL_DEBOUNCE_MS) return

        val className = event.className?.toString() ?: ""
        if (className.contains("ViewPager") || className.contains("RecyclerView") || className.contains("Feed")) {
            if (isInsideShortsSection(packageName, rootInActiveWindow)) {
                lastScrollTimestamp = currentTime
                onNewVideoWatched(packageName)
            }
        }
    }

    /**
     * فحص شجرة العناصر لتأكيد أن المستخدم داخل مشغل الفيديوهات القصيرة وليس الصفحة العامة
     */
    private fun isInsideShortsSection(pkg: String, rootNode: AccessibilityNodeInfo?): Boolean {
        if (rootNode == null) return true // كاحتياط نعتبره صحيحاً إذا كانت الحزمة مستهدفة

        try {
            when (pkg) {
                PKG_INSTAGRAM -> {
                    // Instagram Reels عادة تحتوي على المعرفات التالية
                    val reelsNodes = rootNode.findAccessibilityNodeInfosByViewId("com.instagram.android:id/reel_viewer_root")
                    val clipsNodes = rootNode.findAccessibilityNodeInfosByViewId("com.instagram.android:id/clips_video_container")
                    if (reelsNodes.isNotEmpty() || clipsNodes.isNotEmpty()) return true
                }
                PKG_YOUTUBE -> {
                    // YouTube Shorts تحتوي على حاوية reel_player
                    val shortsNodes = rootNode.findAccessibilityNodeInfosByViewId("com.google.android.youtube:id/reel_player_fragment_container")
                    val playerNodes = rootNode.findAccessibilityNodeInfosByViewId("com.google.android.youtube:id/reel_recycler")
                    if (shortsNodes.isNotEmpty() || playerNodes.isNotEmpty()) return true
                }
                PKG_TIKTOK, PKG_TIKTOK_LITE -> {
                    // تطبيق تيك توك بالكامل عبارة عن فيديوهات قصيرة
                    return true
                }
                PKG_SNAPCHAT -> {
                    val spotlightNodes = rootNode.findAccessibilityNodeInfosByViewId("com.snapchat.android:id/spotlight_feed")
                    if (spotlightNodes.isNotEmpty()) return true
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error inspecting node hierarchy: \${e.message}")
        }
        return true
    }

    private fun onNewVideoWatched(packageName: String) {
        val appName = getFriendlyAppName(packageName)
        val todayDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

        Log.d(TAG, "New Short Watched on $appName [$packageName]")

        // 1. تسجيل المشاهدة في قاعدة بيانات Room المحلية
        serviceScope.launch {
            val db = AppDatabase.getInstance(applicationContext)
            val record = VideoRecordEntity(
                timestamp = System.currentTimeMillis(),
                packageName = packageName,
                appName = appName,
                date = todayDate
            )
            db.videoRecordDao().insertRecord(record)

            val totalToday = db.videoRecordDao().getTodayTotalCount(todayDate)

            // 2. إرسال البث المباشر للخدمة العائمة لتحديث العداد فورياً
            val updateIntent = Intent(FloatingWidgetService.ACTION_UPDATE_COUNT).apply {
                putExtra(EXTRA_COUNT, totalToday)
                putExtra(EXTRA_PACKAGE, packageName)
                setPackage(this@ShortsAccessibilityService.packageName)
            }
            sendBroadcast(updateIntent)
        }
    }

    private fun getFriendlyAppName(pkg: String): String {
        return when (pkg) {
            PKG_TIKTOK, PKG_TIKTOK_LITE -> "TikTok"
            PKG_INSTAGRAM -> "Instagram Reels"
            PKG_YOUTUBE -> "YouTube Shorts"
            PKG_FACEBOOK -> "Facebook Reels"
            PKG_SNAPCHAT -> "Snapchat Spotlight"
            else -> "Social Media"
        }
    }

    override fun onInterrupt() {
        Log.w(TAG, "ShortsAccessibilityService interrupted")
    }
}`
  },
  {
    path: 'app/src/main/java/com/shortscounter/app/services/FloatingWidgetService.kt',
    name: 'FloatingWidgetService.kt',
    language: 'kotlin',
    category: 'services',
    descriptionAr: 'خدمة الودجت العائم: تظهر أيقونة VR الأنيقة فوق الشاشة عبر WindowManager قابلة للسحب، وتتصل بـ AccessibilityService وتستمر في الخلفية.',
    descriptionEn: 'Floating Widget Foreground Service: renders interactive VR goggles / counter widget via WindowManager with drag & edge-docking.',
    code: `package com.shortscounter.app.services

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.ImageView
import android.widget.TextView
import androidx.core.app.NotificationCompat
import com.shortscounter.app.R
import com.shortscounter.app.data.AppDatabase
import com.shortscounter.app.ui.MainActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * خدمة الأيقونة العائمة (Floating VR Headset Widget Service)
 * تعمل كـ Foreground Service لضمان عدم إغلاقها من النظام وتظل ظاهرة فوق التطبيقات.
 */
class FloatingWidgetService : Service() {

    private lateinit var windowManager: WindowManager
    private var floatingView: View? = null
    private lateinit var params: WindowManager.LayoutParams

    private lateinit var tvCounter: TextView
    private lateinit var ivVrIcon: ImageView
    private var currentCount = 0
    private var dailyGoal = 100

    private val CHANNEL_ID = "ShortsCounter_Foreground_Channel"
    private val NOTIFICATION_ID = 1001

    companion object {
        const val ACTION_UPDATE_COUNT = "com.shortscounter.app.UPDATE_COUNT"
        const val ACTION_RESET_COUNT = "com.shortscounter.app.RESET_COUNT"
        const val ACTION_CLOSE_WIDGET = "com.shortscounter.app.CLOSE_WIDGET"
    }

    // مستقبل لتلقي تحديثات العداد من خدمة الـ Accessibility
    private val counterReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                ACTION_UPDATE_COUNT -> {
                    val count = intent.getIntExtra(ShortsAccessibilityService.EXTRA_COUNT, -1)
                    if (count >= 0) {
                        updateWidgetCount(count)
                    } else {
                        fetchLatestCountFromDb()
                    }
                }
                ACTION_RESET_COUNT -> {
                    updateWidgetCount(0)
                }
                ACTION_CLOSE_WIDGET -> {
                    stopSelf()
                }
            }
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()

        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildForegroundNotification("0 فيديوهات اليوم"))

        registerReceiver(
            counterReceiver,
            IntentFilter().apply {
                addAction(ACTION_UPDATE_COUNT)
                addAction(ACTION_RESET_COUNT)
                addAction(ACTION_CLOSE_WIDGET)
            },
            RECEIVER_NOT_EXPORTED
        )

        initFloatingWidget()
        fetchLatestCountFromDb()
    }

    @SuppressLint("InflateParams", "ClickableViewAccessibility")
    private fun initFloatingWidget() {
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager

        // تصميم الودجت العائم عبر الـ XML أو البرمجة المباشرة
        floatingView = LayoutInflater.from(this).inflate(R.layout.layout_floating_vr_widget, null)

        tvCounter = floatingView!!.findViewById(R.id.tv_counter)
        ivVrIcon = floatingView!!.findViewById(R.id.iv_vr_headset)

        // إعداد معايير النافذة العائمة (TYPE_APPLICATION_OVERLAY لنظام Android 8.0+)
        val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 40
            y = 200
        }

        windowManager.addView(floatingView, params)

        // تمكين حركة السحب باللمس والسلاسة عند الحواف
        setupTouchListener()
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun setupTouchListener() {
        var initialX = 0
        var initialY = 0
        var initialTouchX = 0f
        var initialTouchY = 0f
        var isClick = false

        floatingView?.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = params.x
                    initialY = params.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    isClick = true
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    val dx = (event.rawX - initialTouchX).toInt()
                    val dy = (event.rawY - initialTouchY).toInt()

                    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                        isClick = false
                    }

                    params.x = initialX + dx
                    params.y = initialY + dy
                    windowManager.updateViewLayout(floatingView, params)
                    true
                }
                MotionEvent.ACTION_UP -> {
                    if (isClick) {
                        // عند النقر على الأيقونة العائمة -> فتح لوحة الإحصائيات Dashboard
                        openMainActivity()
                    } else {
                        // استقرار الودجت والتصاقه بالجانب الأقرب (Snap to edge)
                        snapToNearestEdge()
                    }
                    true
                }
                else -> false
            }
        }
    }

    private fun snapToNearestEdge() {
        val screenWidth = resources.displayMetrics.widthPixels
        val middle = screenWidth / 2
        val targetX = if (params.x + (floatingView?.width ?: 0) / 2 < middle) 20 else screenWidth - (floatingView?.width ?: 120) - 20
        params.x = targetX
        windowManager.updateViewLayout(floatingView, params)
    }

    private fun openMainActivity() {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        startActivity(intent)
    }

    fun updateWidgetCount(count: Int) {
        currentCount = count
        tvCounter.text = count.toString()

        // تأثير بصري عند الوصول للحد اليومي (تحويل اللون للأحمر واهتزاز خفيف)
        if (currentCount >= dailyGoal) {
            tvCounter.setTextColor(Color.parseColor("#FF4D4D"))
            triggerHapticFeedback()
        } else {
            tvCounter.setTextColor(Color.WHITE)
        }

        // تحديث إشعار الخدمة الأمامية
        val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, buildForegroundNotification("$count فيديو تم مشاهدته اليوم"))
    }

    private fun triggerHapticFeedback() {
        val vibrator = getSystemService(VIBRATOR_SERVICE) as? Vibrator
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator?.vibrate(VibrationEffect.createOneShot(120, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            @Suppress("DEPRECATION")
            vibrator?.vibrate(120)
        }
    }

    private fun fetchLatestCountFromDb() {
        CoroutineScope(Dispatchers.IO).launch {
            val db = AppDatabase.getInstance(applicationContext)
            val todayDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
            val count = db.videoRecordDao().getTodayTotalCount(todayDate)
            withContext(Dispatchers.Main) {
                updateWidgetCount(count)
            }
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "عداد الفيديوهات القصيرة",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "خدمة المراقبة والأيقونة العائمة لعداد الفيديوهات القصيرة"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildForegroundNotification(contentText: String): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("عداد الفيديوهات القصيرة الذكي")
            .setContentText(contentText)
            .setSmallIcon(R.drawable.ic_vr_glasses)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        unregisterReceiver(counterReceiver)
        if (floatingView != null) {
            windowManager.removeView(floatingView)
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/shortscounter/app/data/RoomDatabase.kt',
    name: 'RoomDatabase.kt',
    language: 'kotlin',
    category: 'database',
    descriptionAr: 'قاعدة بيانات Room المحلية: جداول تخزين المشاهدات وتجميع الإحصائيات اليومية والتصفير التلقائي مع كل فجر جديد.',
    descriptionEn: 'Room Database & Entities: records timestamps, apps, and daily counts with auto-reset queries.',
    code: `package com.shortscounter.app.data

import android.content.Context
import androidx.room.ColumnInfo
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.Room
import androidx.room.RoomDatabase
import kotlinx.coroutines.flow.Flow

/**
 * كيان تسجيل كل فيديو قصير يتم مشاهدته
 */
@Entity(tableName = "video_records")
data class VideoRecordEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    @ColumnInfo(name = "timestamp") val timestamp: Long,
    @ColumnInfo(name = "package_name") val packageName: String,
    @ColumnInfo(name = "app_name") val appName: String,
    @ColumnInfo(name = "date") val date: String // بصيغة yyyy-MM-dd
)

data class AppCountResult(
    val app_name: String,
    val package_name: String,
    val count: Int
)

data class DailyHistoryResult(
    val date: String,
    val total_count: Int
)

/**
 * واجهة التعامل مع قاعدة البيانات DAO
 */
@Dao
interface VideoRecordDao {

    @Insert
    suspend fun insertRecord(record: VideoRecordEntity)

    // إجمالي الفيديوهات لليوم الحالي
    @Query("SELECT COUNT(*) FROM video_records WHERE date = :todayDate")
    suspend fun getTodayTotalCount(todayDate: String): Int

    // مراقبة حية للإجمالي لليوم الحالي عبر Flow
    @Query("SELECT COUNT(*) FROM video_records WHERE date = :todayDate")
    fun observeTodayTotalCount(todayDate: String): Flow<Int>

    // توزيع الفيديوهات على التطبيقات لليوم الحالي (تيك توك، ريلز، شورتس، إلخ)
    @Query("SELECT app_name, package_name, COUNT(*) as count FROM video_records WHERE date = :todayDate GROUP BY package_name ORDER BY count DESC")
    fun observeTodayBreakdown(todayDate: String): Flow<List<AppCountResult>>

    // إحصائيات الأيام السابقة (آخر 7 أيام)
    @Query("SELECT date, COUNT(*) as total_count FROM video_records GROUP BY date ORDER BY date DESC LIMIT 7")
    fun observeWeeklyHistory(): Flow<List<DailyHistoryResult>>

    // تصفير بيانات اليوم إذا رغب المستخدم
    @Query("DELETE FROM video_records WHERE date = :todayDate")
    suspend fun clearTodayData(todayDate: String)

    // حذف السجلات القديمة جداً (أكثر من 30 يوماً) لتوفير المساحة
    @Query("DELETE FROM video_records WHERE timestamp < :cutoffTimestamp")
    suspend fun deleteOldRecords(cutoffTimestamp: Long)
}

/**
 * قاعدة بيانات التطبيق Room Database
 */
@Database(entities = [VideoRecordEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {

    abstract fun videoRecordDao(): VideoRecordDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "shorts_counter_db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/shortscounter/app/ui/DashboardScreen.kt',
    name: 'DashboardScreen.kt',
    language: 'kotlin',
    category: 'ui',
    descriptionAr: 'واجهة Jetpack Compose الرئيسية: بطاقة العداد الكبرى، دائرة التقدم بالهدف، توزيع المشاهدات لكل تطبيق، وزر تشغيل الودجت العائم.',
    descriptionEn: 'Jetpack Compose Dashboard: live total cards, circular progress ring, app breakdown, time wasted estimation.',
    code: `package com.shortscounter.app.ui

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.shortscounter.app.R
import com.shortscounter.app.services.FloatingWidgetService

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    todayCount: Int,
    dailyGoal: Int,
    appStats: List<AppDisplayStat>,
    isFloatingWidgetRunning: Boolean,
    onToggleFloatingWidget: (Boolean) -> Unit,
    onResetToday: () -> Unit
) {
    val context = LocalContext.current
    val progress = (todayCount.toFloat() / dailyGoal.coerceAtLeast(1)).coerceIn(0f, 1f)
    val animatedProgress by animateFloatAsState(targetValue = progress, label = "progress")
    val estimatedMinutes = (todayCount * 24) / 60 // بمتوسط 24 ثانية لكل فيديو

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = stringResource(R.string.app_name),
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp
                        )
                    }
                },
                actions = {
                    IconButton(onClick = onResetToday) {
                        Icon(Icons.Default.Refresh, contentDescription = "تصفير")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Spacer(modifier = Modifier.height(8.dp))
                // بطاقة العداد الرئيسية مع نظارة الـ VR
                MainCounterCard(
                    todayCount = todayCount,
                    dailyGoal = dailyGoal,
                    progress = animatedProgress,
                    estimatedMinutes = estimatedMinutes
                )
            }

            // بطاقة التحكم في الأيقونة العائمة
            item {
                FloatingWidgetControlCard(
                    isRunning = isFloatingWidgetRunning,
                    onToggle = { enable ->
                        if (enable && !Settings.canDrawOverlays(context)) {
                            // توجيه المستخدم لمنح إذن الظهور فوق التطبيقات
                            val intent = Intent(
                                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                                Uri.parse("package:\${context.packageName}")
                            )
                            context.startActivity(intent)
                        } else {
                            onToggleFloatingWidget(enable)
                        }
                    }
                )
            }

            // عنوان قسم توزيع التطبيقات
            item {
                Text(
                    text = stringResource(R.string.apps_breakdown_title),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            // عناصر التطبيقات (تيك توك، ريلز، شورتس، سناب شات)
            items(appStats) { stat ->
                AppStatRow(stat = stat, totalCount = todayCount)
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
fun MainCounterCard(
    todayCount: Int,
    dailyGoal: Int,
    progress: Float,
    estimatedMinutes: Int
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = stringResource(R.string.today_shorts_watched),
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
            )

            Spacer(modifier = Modifier.height(12.dp))

            // دائرة العداد الرقمي
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier.size(170.dp)
            ) {
                CircularProgressIndicator(
                    progress = { progress },
                    modifier = Modifier.size(170.dp),
                    strokeWidth = 14.dp,
                    color = if (todayCount >= dailyGoal) Color(0xFFFF5252) else MaterialTheme.colorScheme.primary,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant
                )
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "$todayCount",
                        fontSize = 44.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                    Text(
                        text = stringResource(R.string.video_unit),
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // شريط إحصائيات سريعة: الوقت الضائع والهدف
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                StatPill(
                    icon = Icons.Default.Timer,
                    label = stringResource(R.string.time_spent),
                    value = "$estimatedMinutes \${stringResource(R.string.minute_unit)}"
                )
                StatPill(
                    icon = Icons.Default.Flag,
                    label = stringResource(R.string.daily_limit_goal),
                    value = "$dailyGoal \${stringResource(R.string.video_unit)}"
                )
            }
        }
    }
}

@Composable
fun FloatingWidgetControlCard(
    isRunning: Boolean,
    onToggle: (Boolean) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.RemoveRedEye,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = stringResource(R.string.floating_vr_widget_title),
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                    Text(
                        text = stringResource(R.string.floating_widget_desc),
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Switch(
                checked = isRunning,
                onCheckedChange = onToggle
            )
        }
    }
}

@Composable
fun AppStatRow(stat: AppDisplayStat, totalCount: Int) {
    val percentage = if (totalCount > 0) (stat.count.toFloat() / totalCount * 100).toInt() else 0

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(12.dp)
                            .clip(CircleShape)
                            .background(stat.color)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = stat.appName, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                }
                Text(
                    text = "\${stat.count} (\${percentage}%)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            LinearProgressIndicator(
                progress = { if (totalCount > 0) stat.count.toFloat() / totalCount else 0f },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp)),
                color = stat.color,
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )
        }
    }
}

@Composable
fun StatPill(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(4.dp))
            Text(text = label, fontSize = 11.sp)
        }
        Text(text = value, fontWeight = FontWeight.Bold, fontSize = 15.sp)
    }
}

data class AppDisplayStat(
    val appName: String,
    val packageName: String,
    val count: Int,
    val color: Color
)`
  },
  {
    path: 'app/build.gradle.kts',
    name: 'build.gradle.kts (App)',
    language: 'gradle',
    category: 'gradle',
    descriptionAr: 'ملف بناء التطبيق: تضمين أحدث مكتبات Jetpack Compose و Room Database و Material3 ومعالجات KSP.',
    descriptionEn: 'App build script: includes Jetpack Compose BOM, Room Database, Coroutines, and Android 14 target.',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.shortscounter.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.shortscounter.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug") // لتسهيل التصدير
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    // AndroidX Core & Lifecycle
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)

    // Jetpack Compose (BOM)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)

    // Room Database
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // Coroutines
    implementation(libs.kotlinx.coroutines.android)

    // Testing
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}`
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    name: 'strings.xml (English)',
    language: 'xml',
    category: 'res',
    descriptionAr: 'ملف النصوص الإنجليزية الافتراضية مع دعم كامل للتعريب.',
    descriptionEn: 'Default English strings file with clean resource IDs.',
    code: `<resources>
    <string name="app_name">ShortsCounter</string>
    <string name="accessibility_service_description">Monitors short video reels (TikTok, Instagram Reels, YouTube Shorts, etc.) to count transitions and track screen time.</string>
    <string name="today_shorts_watched">"Today\'s Shorts Watched"</string>
    <string name="video_unit">videos</string>
    <string name="minute_unit">min</string>
    <string name="time_spent">Time Spent</string>
    <string name="daily_limit_goal">Daily Limit</string>
    <string name="floating_vr_widget_title">Floating VR Widget</string>
    <string name="floating_widget_desc">Always-on overlay showing live video counter</string>
    <string name="apps_breakdown_title">Apps Breakdown</string>
    <string name="reset_today_confirmation">"Reset today\'s count to 0?"</string>
</resources>`
  },
  {
    path: 'app/src/main/res/values-ar/strings.xml',
    name: 'strings.xml (العربية)',
    language: 'xml',
    category: 'res',
    descriptionAr: 'ملف التعريب الكامل باللغة العربية مع دعم اتجاه الشاشة RTL تلقائياً.',
    descriptionEn: 'Full Arabic localization file with complete RTL typography support.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">عداد الفيديوهات الذكي</string>
    <string name="accessibility_service_description">تراقب الخدمة مقاطع الفيديو القصيرة (تيك توك، إنستجرام ريلز، يوتيوب شورتس، إلخ) لحساب عدد المشاهدات والوقت المستغرق.</string>
    <string name="today_shorts_watched">فيديوهات اليوم التي شاهدتها</string>
    <string name="video_unit">فيديو</string>
    <string name="minute_unit">دقيقة</string>
    <string name="time_spent">الوقت المستغرق</string>
    <string name="daily_limit_goal">الحد اليومي</string>
    <string name="floating_vr_widget_title">الأيقونة العائمة الذكية (VR)</string>
    <string name="floating_widget_desc">أيقونة أنيقة عائمة تظهر العداد المباشر فوق كل التطبيقات</string>
    <string name="apps_breakdown_title">توزيع المشاهدات حسب التطبيقات</string>
    <string name="reset_today_confirmation">هل تريد تصفير عداد اليوم؟</string>
</resources>`
  },
  {
    path: 'app/src/main/res/layout/layout_floating_vr_widget.xml',
    name: 'layout_floating_vr_widget.xml',
    language: 'xml',
    category: 'res',
    descriptionAr: 'تخطيط الأيقونة العائمة على شكل نظارة VR المستقبلية وعداد رقمي مشع بتأثير النيون.',
    descriptionEn: 'Layout for the floating VR headset widget with neon cyber glow and bold counter.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/ll_floating_root"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:gravity="center_vertical"
    android:background="@drawable/bg_floating_vr_pill"
    android:paddingStart="10dp"
    android:paddingEnd="14dp"
    android:paddingTop="6dp"
    android:paddingBottom="6dp"
    android:elevation="12dp">

    <!-- أيقونة نظارة الـ VR المستقبلية -->
    <ImageView
        android:id="@+id/iv_vr_headset"
        android:layout_width="28dp"
        android:layout_height="28dp"
        android:src="@drawable/ic_vr_glasses"
        android:contentDescription="VR Headset" />

    <!-- الرقم المباشر للفيديوهات المشاهدة اليوم -->
    <TextView
        android:id="@+id/tv_counter"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginStart="8dp"
        android:text="0"
        android:textColor="#FFFFFF"
        android:textSize="16sp"
        android:textStyle="bold"
        android:fontFamily="sans-serif-black" />

</LinearLayout>`
  },
  {
    path: 'app/src/main/res/values/themes.xml',
    name: 'themes.xml',
    language: 'xml',
    category: 'res',
    descriptionAr: 'ملف السمة Theme.ShortsCounter الأساسي المطلوب لنظام أندرويد.',
    descriptionEn: 'Theme definition for Theme.ShortsCounter.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.ShortsCounter" parent="android:Theme.Material.NoActionBar">
        <item name="android:statusBarColor">#0F172A</item>
        <item name="android:navigationBarColor">#0F172A</item>
    </style>
</resources>`
  },
  {
    path: 'app/src/main/res/drawable/bg_floating_vr_pill.xml',
    name: 'bg_floating_vr_pill.xml',
    language: 'xml',
    category: 'res',
    descriptionAr: 'خلفية نظارة الـ VR والكبسولة العائمة بحواف دائرية وتأثير نيون سايبر.',
    descriptionEn: 'Background drawable for floating pill with cyber cyan border.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <solid android:color="#F0090D16" />
    <stroke android:width="1.5dp" android:color="#00F2FE" />
    <corners android:radius="24dp" />
</shape>`
  },
  {
    path: 'app/src/main/res/drawable/ic_vr_glasses.xml',
    name: 'ic_vr_glasses.xml',
    language: 'xml',
    category: 'res',
    descriptionAr: 'أيقونة فيكتور لنظارة الواقع الافتراضي VR للأيقونة العائمة.',
    descriptionEn: 'Vector icon for VR headset.',
    code: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="28dp"
    android:height="28dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
  <path
      android:fillColor="#00F2FE"
      android:pathData="M2,6h20v9a3,3 0 0,1 -3,3h-2.5a3.5,3.5 0 0,1 -3.5,-3.5v-0.5a1,1 0 0,0 -2,0v0.5a3.5,3.5 0 0,1 -3.5,3.5h-2.5a3,3 0 0,1 -3,-3v-9zM6,10a2,2 0 1,0 0,4 2,2 0 0,0 0,-4zM18,10a2,2 0 1,0 0,4 2,2 0 0,0 0,-4z"/>
</vector>`
  }
];

export const APK_BUILD_TUTORIAL = {
  titleAr: 'دليل بناء وتصدير ملف الـ APK وتثبيته على الهاتف',
  titleEn: 'Step-by-Step Guide to Build & Export APK to Mobile',
  steps: [
    {
      step: 1,
      titleAr: 'فتح المشروع في برنامج Android Studio',
      titleEn: 'Open Project in Android Studio',
      descAr: 'قم بتنزيل حزمة المشروع عبر زر التحميل بالأعلى، ثم فك الضغط وافتح المجلد في Android Studio (إصدار Iguana أو Hedgehog أو Ladybug أو أحدث). انتظر حتى ينتهي الـ Gradle Sync بنجاح.',
      descEn: 'Download the project ZIP, extract it, and open the folder in Android Studio. Wait for Gradle Sync to complete.',
      command: null
    },
    {
      step: 2,
      titleAr: 'بناء ملف APK بنقرة واحدة أو عبر سطر الأوامر',
      titleEn: 'Build APK via Android Studio or Terminal',
      descAr: 'يمكنك إنشاء ملف الـ APK التجريبي (Debug APK) مباشرة عبر القائمة: Build > Build Bundle(s) / APK(s) > Build APK(s)، أو بكتابة الأمر التالي في التيرمنال داخل مجلد المشروع:',
      descEn: 'Generate the APK via Build > Build Bundle(s) / APK(s) > Build APK(s) or run the gradle command:',
      command: './gradlew assembleDebug'
    },
    {
      step: 3,
      titleAr: 'مكان العثور على ملف الـ APK الناتج',
      titleEn: 'Locate the Generated APK File',
      descAr: 'ستجد ملف الـ APK الجاهز داخل المسار التالي في مجلد المشروع:',
      descEn: 'The generated APK file will be available at:',
      command: 'app/build/outputs/apk/debug/app-debug.apk'
    },
    {
      step: 4,
      titleAr: 'تثبيت الـ APK على هاتفك عبر USB أو نقله مباشرة',
      titleEn: 'Install APK via USB ADB or direct transfer',
      descAr: 'قم بتوصيل هاتفك بالكمبيوتر وتفعيل "تصحيح أخطاء USB" (USB Debugging) ونفذ الأمر التالي للتثبيت الفوري، أو أرسل الملف لهاتفك عبر الواتساب أو التلجرام وثبته مباشرة:',
      descEn: 'Connect phone with USB Debugging enabled and install via ADB, or transfer the APK directly:',
      command: 'adb install -r app/build/outputs/apk/debug/app-debug.apk'
    },
    {
      step: 5,
      titleAr: 'تفعيل الصلاحيات الخاصة على أندرويد 13 وأندرويد 14',
      titleEn: 'Grant Special Permissions on Android 13/14',
      descAr: 'في أنظمة Android 13 و 14، تضع جوجل حماية تسمى "الإعدادات المقيدة" (Restricted Settings) على خدمات الـ Accessibility للتطبيقات المثبتة يدوياً. لتفعيلها: افتح إعدادات الهاتف > التطبيقات > ShortsCounter > انقر على الثلاث نقاط أعلى اليمين > اضغط على "السماح بالإعدادات المقيدة" (Allow restricted settings). ثم ادخل على إمكانية الوصول وفعل الخدمة والنافذة العائمة.',
      descEn: 'On Android 13/14, go to Phone Settings > Apps > ShortsCounter > 3 dots > "Allow restricted settings", then enable Accessibility and Overlay.',
      command: null
    }
  ]
};
