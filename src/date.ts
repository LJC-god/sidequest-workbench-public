/** Local-calendar-day helpers. All product dates are local days, never UTC instants. */

export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return dayKey(new Date());
}

export function parseDay(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

/** "今日 · 9月22日 · 周二" style headline for a local day. */
export function formatDayTitle(key: string): string {
  const d = parseDay(key);
  return `${d.getMonth() + 1}月${d.getDate()}日 · ${WEEKDAYS[d.getDay()]}`;
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
