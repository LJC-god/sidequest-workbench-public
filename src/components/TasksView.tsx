import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Account, Task, TaskStatus } from '../types';
import { STATUS_LABEL, TASK_STATUSES } from '../types';
import { TaskRow } from './TaskRow';

interface TasksViewProps {
  tasks: Task[];
  accounts: Account[];
  onAdvance: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

/** All tasks grouped by status, ordered by planned date/time within a group. */
export function TasksView({ tasks, accounts, onAdvance, onEdit, onDelete }: TasksViewProps) {
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...tasks].sort(
      (a, b) => a.plannedDate.localeCompare(b.plannedDate) || (a.plannedTime ?? '99').localeCompare(b.plannedTime ?? '99'),
    );
    if (q === '') return sorted;
    return sorted.filter((t) => {
      const accountName = accounts.find((a) => a.id === t.accountId)?.name ?? '';
      return `${t.title} ${t.note} ${accountName} ${t.plannedDate}`.toLowerCase().includes(q);
    });
  }, [tasks, accounts, query]);

  return (
    <section className="task-section" aria-labelledby="tasks-title">
      <div className="section-head">
        <h2 id="tasks-title">全部任务 <span className="count-badge">{visible.length}</span></h2>
        <div className="section-tools">
          <div className="search-box">
            <Search size={15} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索任务、账号或日期…"
              aria-label="搜索全部任务"
            />
          </div>
        </div>
      </div>
      {visible.length === 0 && <p className="empty-hint">没有符合搜索的任务。</p>}
      {TASK_STATUSES.map((status: TaskStatus) => {
        const group = visible.filter((t) => t.status === status);
        if (group.length === 0) return null;
        return (
          <section key={status} className="task-group" aria-label={STATUS_LABEL[status]}>
            <h3 className="group-title">
              <span className={`status status-${status}`}>{STATUS_LABEL[status]}</span>
              <span className="group-count">{group.length}</span>
            </h3>
            <ul className="task-list">
              {group.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  account={accounts.find((a) => a.id === t.accountId)}
                  onAdvance={onAdvance}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </section>
  );
}
