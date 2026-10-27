import { ANDROID_PROJECT_FILES } from '../data/androidProjectFiles';

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
}

export interface WorkflowRunStatus {
  id: number;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'cancelled' | null;
  html_url: string;
  created_at: string;
}

export interface ArtifactInfo {
  id: number;
  name: string;
  size_in_bytes: number;
  archive_download_url: string;
}

export async function verifyGitHubToken(token: string): Promise<GitHubUser> {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('التوكن غير صالح أو منتهي الصلاحية (Invalid Token)');
    }
    throw new Error(`خطأ في الاتصال مع GitHub: ${res.statusText}`);
  }

  const data = await res.json();
  return {
    login: data.login,
    name: data.name || data.login,
    avatar_url: data.avatar_url,
  };
}

export async function createRepoAndUploadProject(
  token: string,
  repoName: string,
  onProgress: (status: string, step: number) => void
): Promise<{ owner: string; repo: string; repoUrl: string }> {
  const cleanToken = token.trim();
  const headers = {
    Authorization: `Bearer ${cleanToken}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  // 1. Get authenticated user
  onProgress('جاري التحقق من حساب GitHub...', 1);
  const user = await verifyGitHubToken(cleanToken);

  // 2. Check if repo exists or create it
  onProgress(`جاري إنشاء مستودع جديد (${repoName}) على حسابك...`, 2);
  let repoData: any;
  const checkRes = await fetch(`https://api.github.com/repos/${user.login}/${repoName}`, {
    headers,
  });

  if (checkRes.ok) {
    repoData = await checkRes.json();
  } else {
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: repoName,
        description: 'ShortsCounter - Smart Short Video & Reels Counter Android App',
        private: false,
        auto_init: true,
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err.message || 'فشل إنشاء المستودع على GitHub');
    }
    repoData = await createRes.json();
  }

  // Allow GitHub a moment to initialize the repo
  await new Promise((r) => setTimeout(r, 1500));

  // 3. Prepare all files to upload
  onProgress('جاري تجهيز ملفات كود Kotlin و XML و Gradle وسيرفر البناء...', 3);

  const workflowContent = `name: Build ShortsCounter APK

on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    name: Build Android APK
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Setup Gradle
        uses: gradle/actions/setup-gradle@v3

      - name: Build APK with Gradle
        run: |
          if [ -f "./gradlew" ]; then
            chmod +x ./gradlew
            ./gradlew assembleDebug --no-daemon --stacktrace
          else
            gradle assembleDebug --no-daemon --stacktrace
          fi

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: ShortsCounter-Debug-APK
          path: app/build/outputs/apk/debug/*.apk
          retention-days: 14
`;

  const filesToCommit: Array<{ path: string; content: string }> = [
    {
      path: '.github/workflows/build-apk.yml',
      content: workflowContent,
    },
    {
      path: 'settings.gradle.kts',
      content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "ShortsCounter"
include(":app")
`,
    },
    {
      path: 'build.gradle.kts',
      content: `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.ksp) apply false
}
`,
    },
    {
      path: 'gradle.properties',
      content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`,
    },
    {
      path: 'gradlew',
      content: `#!/bin/sh
gradle assembleDebug "$@"
`,
    },
    {
      path: 'gradle/wrapper/gradle-wrapper.properties',
      content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`,
    },
    {
      path: 'gradle/libs.versions.toml',
      content: `[versions]
agp = "8.3.1"
kotlin = "2.0.0"
coreKtx = "1.13.1"
junit = "4.13.2"
junitVersion = "1.1.5"
espressoCore = "3.5.1"
lifecycleRuntimeKtx = "2.8.0"
activityCompose = "1.9.0"
composeBom = "2024.05.00"
room = "2.6.1"
ksp = "2.0.0-1.0.21"
coroutines = "1.8.0"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
junit = { group = "junit", name = "junit", version.ref = "junit" }
androidx-junit = { group = "androidx.test.ext", name = "junit", version.ref = "junitVersion" }
androidx-espresso-core = { group = "androidx.test.espresso", name = "espresso-core", version.ref = "espressoCore" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-compose-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-compose-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-compose-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-compose-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-compose-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }
androidx-compose-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-compose-ui-test-manifest = { group = "androidx.compose.ui", name = "ui-test-manifest" }
androidx-compose-ui-test-junit4 = { group = "androidx.compose.ui", name = "ui-test-junit4" }
androidx-room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
androidx-room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
androidx-room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
`,
    },
    ...ANDROID_PROJECT_FILES.map((f) => ({
      path: f.path,
      content: f.code,
    })),
  ];

  // 4. Create Git tree and commit files
  onProgress('جاري رفع الكود إلى المستودع عبر Git Tree API...', 4);

  // Get default branch reference
  const branchName = repoData.default_branch || 'main';
  let parentCommitSha: string | null = null;
  const refRes = await fetch(
    `https://api.github.com/repos/${user.login}/${repoName}/git/ref/heads/${branchName}`,
    { headers }
  );

  if (refRes.ok) {
    const refData = await refRes.json();
    parentCommitSha = refData.object.sha;
  }

  // Create tree entries
  const treeEntries = filesToCommit.map((f) => ({
    path: f.path,
    mode: '100644',
    type: 'blob',
    content: f.content,
  }));

  const treeRes = await fetch(
    `https://api.github.com/repos/${user.login}/${repoName}/git/trees`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        base_tree: parentCommitSha || undefined,
        tree: treeEntries,
      }),
    }
  );

  if (!treeRes.ok) {
    const err = await treeRes.json();
    throw new Error(err.message || 'فشل إنشاء شجرة الملفات على GitHub');
  }
  const treeData = await treeRes.json();

  // Create commit
  onProgress('جاري تثبيت التعديلات (Commit) وتشغيل GitHub Actions...', 5);
  const commitRes = await fetch(
    `https://api.github.com/repos/${user.login}/${repoName}/git/commits`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: 'Initial release: ShortsCounter Android App with GitHub Actions Cloud Build',
        tree: treeData.sha,
        parents: parentCommitSha ? [parentCommitSha] : [],
      }),
    }
  );

  if (!commitRes.ok) {
    const err = await commitRes.json();
    throw new Error(err.message || 'فشل عمل Commit');
  }
  const commitData = await commitRes.json();

  // Update head ref
  if (parentCommitSha) {
    await fetch(
      `https://api.github.com/repos/${user.login}/${repoName}/git/refs/heads/${branchName}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          sha: commitData.sha,
          force: true,
        }),
      }
    );
  } else {
    await fetch(
      `https://api.github.com/repos/${user.login}/${repoName}/git/refs`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: commitData.sha,
        }),
      }
    );
  }

  onProgress('تم رفع المشروع بنجاح! خوادم GitHub Actions بدأت بناء الـ APK الآن ⚡', 6);

  return {
    owner: user.login,
    repo: repoName,
    repoUrl: repoData.html_url,
  };
}

export async function fetchLatestWorkflowRun(
  token: string,
  owner: string,
  repo: string
): Promise<WorkflowRunStatus | null> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=1`,
    {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  if (data.workflow_runs && data.workflow_runs.length > 0) {
    const run = data.workflow_runs[0];
    return {
      id: run.id,
      status: run.status,
      conclusion: run.conclusion,
      html_url: run.html_url,
      created_at: run.created_at,
    };
  }
  return null;
}

export async function fetchRunArtifacts(
  token: string,
  owner: string,
  repo: string,
  runId: number
): Promise<ArtifactInfo[]> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`,
    {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!res.ok) return [];
  const data = await res.json();
  return (data.artifacts || []).map((art: any) => ({
    id: art.id,
    name: art.name,
    size_in_bytes: art.size_in_bytes,
    archive_download_url: art.archive_download_url,
  }));
}
