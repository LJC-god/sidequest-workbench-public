import { useMemo, useState } from 'react';
import { Bell, ChevronRight, Search, X } from 'lucide-react';
import type { Account, Task, TaskStatus } from '../types';
import { STATUS_LABEL, TASK_STATUSES } from '../types';
import { todayKey } from '../date';
import { TaskRow } from './TaskRow';
import { PulseTimeline } from './PulseTimeline';
import type { HistoryRecord, Settings } from '../types';

type Filter = TaskStatus | 'all';

interface TodayViewProps {
  tasks: Task[];
  accounts: Account[];
  history: HistoryRecord[];
  settings: Settings;
  planConfirmed: boolean;
  onConfirmPlan: () => void;
  onAdvance: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TodayView(props: TodayViewProps) {
  const { tasks, accounts, history, settings, planConfirmed } = props;
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const today = todayKey();
  const todayTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.plannedDate === today)
        .sort((a, b) => (a.plannedTime ?? '99' ).localeCompare(b.plannedTime ?? '99')),
    [tasks, today],
  );

  const visible = todayTasks.filter((t) => {
    if (filter !== 'all' && t.status !== filter) return false;
    const q = query.trim().toLowerCase();
    if (q === '') return true;
    const accountName = accounts.find((a) => a.id === t.accountId)?.name ?? '';
    return `${t.title} ${t.note} ${accountName}`.toLowerCase().includes(q);
  });

  const counts = (status: TaskStatus) => todayTasks.filter((t) => t.status === status).length;

  return (
    <>
      {!planConfirmed && !bannerDismissed && (
        <div className="plan-banner" role="status">
          <Bell size={20} aria-hidden="true" className="plan-icon" />
          <div className="plan-text">
            <p className="plan-title">今日计划尚未确认</p>
            <p className="plan-sub">确认后将基于你的计划进行任务提醒与进度统计。</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={props.onConfirmPlan}>
            确认今日计划 <ChevronRight size={15} aria-hidden="true" />
          </button>
          <button type="button" className="icon-btn" aria-label="关闭计划提醒" onClick={() => setBannerDismissed(true)}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      <PulseTimeline todayTasks={todayTasks} history={history} settings={settings} />

      <section className="task-section" aria-labelledby="today-tasks-title">
        <div className="section-head">
          <h2 id="today-tasks-title">今日任务</h2>
          <div className="section-tools">
            <div className="search-box">
              <Search size={15} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索任务或账号…"
                aria-label="搜索今日任务"
              />
            </div>
          </div>
        </div>
        <div className="filter-chips" role="group" aria-label="按状态筛选">
          <button
            type="button"
            className={`chip${filter === 'all' ? ' is-active' : ''}`}
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            全部 {todayTasks.length}
          </button>
          {TASK_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`chip${filter === s ? ' is-active' : ''}`}
              aria-pressed={filter === s}
              onClick={() => setFilter(s)}
            >
              {STATUS_LABEL[s]} {counts(s)}
            </button>
          ))}
        </div>
        {visible.length === 0 ? (
          <p className="empty-hint">
            {todayTasks.length === 0 ? '今天还没有安排任务，点击右上角「新建任务」开始。' : '没有符合当前筛选或搜索的任务。'}
          </p>
        ) : (
          <ul className="task-list">
            {visible.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                account={accounts.find((a) => a.id === t.accountId)}
                onAdvance={props.onAdvance}
                onEdit={props.onEdit}
                onDelete={props.onDelete}
              />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
