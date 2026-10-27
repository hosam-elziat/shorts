import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getTodayDateString,
  shouldResetDay,
  calculateEstimatedMinutes,
  calculateGoalProgress,
  isGoalExceeded,
  canIncrementScroll,
  matchAppByPackage,
  TARGET_APPS
} from './counterEngine';

test('getTodayDateString formats correctly as YYYY-MM-DD', () => {
  const d = new Date(2026, 9, 26); // Oct 26, 2026
  assert.equal(getTodayDateString(d), '2026-10-26');
});

test('shouldResetDay detects date transition', () => {
  assert.equal(shouldResetDay('2026-10-25', '2026-10-26'), true);
  assert.equal(shouldResetDay('2026-10-26', '2026-10-26'), false);
});

test('calculateEstimatedMinutes computes screen time correctly', () => {
  // 50 videos * 24 seconds = 1200 seconds = 20 minutes
  assert.equal(calculateEstimatedMinutes(50, 24), 20);
  assert.equal(calculateEstimatedMinutes(0, 24), 0);
});

test('calculateGoalProgress and limit thresholds', () => {
  assert.equal(calculateGoalProgress(25, 100), 25);
  assert.equal(calculateGoalProgress(120, 100), 100);
  assert.equal(isGoalExceeded(99, 100), false);
  assert.equal(isGoalExceeded(100, 100), true);
  assert.equal(isGoalExceeded(105, 100), true);
});

test('canIncrementScroll debounces rapid scroll events', () => {
  const now = 1000;
  // 300ms later -> too fast, must reject
  assert.equal(canIncrementScroll(now, now + 300, 650), false);
  // 700ms later -> valid swipe, accept
  assert.equal(canIncrementScroll(now, now + 700, 650), true);
});

test('matchAppByPackage finds target applications', () => {
  const tiktok = matchAppByPackage('com.zhiliaoapp.musically');
  assert.ok(tiktok);
  assert.equal(tiktok?.id, 'tiktok');

  const youtube = matchAppByPackage('com.google.android.youtube');
  assert.ok(youtube);
  assert.equal(youtube?.id, 'youtube');

  assert.equal(matchAppByPackage('com.unknown.calculator'), undefined);
});
