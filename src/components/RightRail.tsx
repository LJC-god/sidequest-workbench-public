import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardList, History, PlusCircle } from 'lucide-react';
import type { Account, Task } from '../types';
import { parseDay, todayKey } from '../date';
import type { ViewKey } from './Sidebar';

interface RightRailProps {
  tasks: Task[];
  accounts: Account[];
  onNavigate: (view: ViewKey) => void;
  onCreateTask: () => void;
}

function MiniCalendar() {
  const [cursor, setCursor] = useState(() => {
    const d = parseDay(todayKey());
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const today = todayKey();

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first offset
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <section className="rail-card" aria-labelledby="calendar-title">
      <div className="rail-head">
        <h2 id="calendar-title">{year} 年 {month + 1} 月</h2>
        <div className="rail-head-actions">
          <button
            type="button"
            className="icon-btn"
            aria-label="上一个月"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
          >
            <ChevronLeft size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="下一个月"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
          >
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
      <table className="mini-calendar">
        <thead>
          <tr>
            {['一', '二', '三', '四', '五', '六', '日'].map((d) => (
              <th key={d} scope="col">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(cells.length / 7) }, (_, w) => (
            <tr key={w}>
              {cells.slice(w * 7, w * 7 + 7).map((day, i) => {
                const key = day === null ? '' : `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                return (
                  <td key={i} className={key === today ? 'is-today' : ''}>
                    {day ?? ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function RightRail({ tasks, accounts, onNavigate, onCreateTask }: RightRailProps) {
  const today = todayKey();
  const todayTasks = tasks.filter((t) => t.plannedDate === today);

  return (
    <aside className="right-rail" aria-label="账号进度与快捷操作">
      <section className="rail-card" aria-labelledby="accounts-progress-title">
        <div className="rail-head">
          <h2 id="accounts-progress-title">各账号今日进度</h2>
        </div>
        <ul className="account-progress">
          {accounts.filter((a) => a.active).map((a) => {
            const mine = todayTasks.filter((t) => t.accountId === a.id);
            const done = mine.filter((t) => t.status === 'done').length;
            const pct = mine.length === 0 ? 0 : Math.round((done / mine.length) * 100);
            return (
              <li key={a.id}>
                <div className="account-line">
                  <span className="account-dot" style={{ background: a.color }} aria-hidden="true" />
                  <span className="account-name">{a.name}</span>
                  <span className="account-count">{done} / {mine.length}</span>
                </div>
                <div className="progress-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${a.name} 今日完成度`}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: a.color }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <MiniCalendar />

      <section className="rail-card" aria-labelledby="quick-actions-title">
        <div className="rail-head">
          <h2 id="quick-actions-title">快捷操作</h2>
        </div>
        <ul className="quick-actions">
          <li>
            <button type="button" onClick={onCreateTask}>
              <PlusCircle size={16} aria-hidden="true" /> 新建任务 <ChevronRight size={14} aria-hidden="true" className="qa-tail" />
            </button>
          </li>
          <li>
            <button type="button" onClick={() => onNavigate('tasks')}>
              <ClipboardList size={16} aria-hidden="true" /> 查看全部任务 <ChevronRight size={14} aria-hidden="true" className="qa-tail" />
            </button>
          </li>
          <li>
            <button type="button" onClick={() => onNavigate('history')}>
              <History size={16} aria-hidden="true" /> 查看完成历史 <ChevronRight size={14} aria-hidden="true" className="qa-tail" />
            </button>
          </li>
          <li>
            <button type="button" onClick={() => onNavigate('settings')}>
              <CalendarDays size={16} aria-hidden="true" /> 数据与设置 <ChevronRight size={14} aria-hidden="true" className="qa-tail" />
            </button>
          </li>
        </ul>
      </section>
    </aside>
  );
}
