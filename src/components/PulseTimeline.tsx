import type { HistoryRecord, Settings, Task } from '../types';
import { STATUS_LABEL } from '../types';
import { dayKey, parseDay, todayKey } from '../date';

const AXIS_START = 8; // 08:00
const AXIS_END = 22; // 22:00
const HOURS = Array.from({ length: AXIS_END - AXIS_START + 1 }, (_, i) => AXIS_START + i);

interface PulseTimelineProps {
  todayTasks: Task[];
  history: HistoryRecord[];
  settings: Settings;
}

function creationStreak(history: HistoryRecord[]): number {
  const days = new Set(history.map((h) => h.completedOn));
  let cursor = new Date();
  if (!days.has(dayKey(cursor))) {
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
    if (!days.has(dayKey(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
  }
  return streak;
}

function weekStart(today: string, weekStartsOn: 0 | 1): Date {
  const d = parseDay(today);
  const offset = (d.getDay() - weekStartsOn + 7) % 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset);
}

/**
 * 今日脉搏: today's completion rhythm, creation streak and weekly deliverables
 * merged into one readable timeline instead of isolated number cards.
 */
export function PulseTimeline({ todayTasks, history, settings }: PulseTimelineProps) {
  const doneCount = todayTasks.filter((t) => t.status === 'done').length;
  const streak = creationStreak(history);
  const weekFrom = dayKey(weekStart(todayKey(), settings.weekStartsOn));
  const weekDelivered = history.filter((h) => h.completedOn >= weekFrom).length;

  const timed = todayTasks
    .filter((t) => t.plannedTime !== null)
    .sort((a, b) => (a.plannedTime ?? '').localeCompare(b.plannedTime ?? ''));
  const untimed = todayTasks.filter((t) => t.plannedTime === null);

  return (
    <section className="pulse" aria-labelledby="pulse-title">
      <div className="pulse-head">
        <h2 id="pulse-title">今日脉搏</h2>
        <p className="pulse-stats">
          <strong>{doneCount} / {todayTasks.length}</strong> 已完成
          <span className="pulse-sep" aria-hidden="true" />
          连续创作 <strong>{streak}</strong> 天
          <span className="pulse-sep" aria-hidden="true" />
          本周已交付 <strong>{weekDelivered}</strong> 件
        </p>
      </div>
      <div
        className="pulse-track"
        role="img"
        aria-label={`今日时间线：${doneCount}/${todayTasks.length} 个任务已完成`}
      >
        <div className="pulse-axis">
          {timed.map((t) => {
            const [h, m] = (t.plannedTime ?? '00:00').split(':').map(Number);
            const pos = Math.min(100, Math.max(0, ((h + m / 60 - AXIS_START) / (AXIS_END - AXIS_START)) * 100));
            return (
              <span
                key={t.id}
                className={`pulse-dot pulse-${t.status}`}
                style={{ left: `${pos}%` }}
                title={`${t.plannedTime} ${t.title}（${STATUS_LABEL[t.status]}）`}
              />
            );
          })}
        </div>
        <div className="pulse-hours" aria-hidden="true">
          {HOURS.map((h) => (
            <span key={h}>{h}:00</span>
          ))}
        </div>
      </div>
      {untimed.length > 0 && (
        <p className="pulse-untimed">未排时 {untimed.length} 项：{untimed.map((t) => t.title).join('、')}</p>
      )}
    </section>
  );
}
