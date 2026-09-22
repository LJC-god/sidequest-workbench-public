import { Check, Pencil, Trash2 } from 'lucide-react';
import type { Account, Task } from '../types';
import { NEXT_ACTION_LABEL, PRIORITY_LABEL, STATUS_LABEL } from '../types';

interface TaskRowProps {
  task: Task;
  account: Account | undefined;
  onAdvance: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskRow({ task, account, onAdvance, onEdit, onDelete }: TaskRowProps) {
  const nextLabel = NEXT_ACTION_LABEL[task.status];
  const done = task.status === 'done';

  return (
    <li className={`task-row${done ? ' is-done' : ''}`}>
      <span className={`priority priority-${task.priority}`} title={`优先级：${PRIORITY_LABEL[task.priority]}`}>
        {PRIORITY_LABEL[task.priority]}
      </span>
      <div className="task-main">
        <p className="task-title">{task.title}</p>
        {task.note && <p className="task-note">{task.note}</p>}
      </div>
      <div className="task-account">
        <span className="account-dot" style={{ background: account?.color ?? '#9aa39b' }} aria-hidden="true" />
        <span>{account?.name ?? '未关联账号'}</span>
      </div>
      <span className="task-time">{task.plannedTime ?? '未排时'}</span>
      <span className={`status status-${task.status}`}>{STATUS_LABEL[task.status]}</span>
      <div className="task-actions">
        {nextLabel ? (
          <button type="button" className="btn btn-next" onClick={() => onAdvance(task.id)}>
            {task.status === 'review' ? <Check size={14} aria-hidden="true" /> : null}
            {nextLabel}
          </button>
        ) : (
          <span className="done-mark">
            <Check size={14} aria-hidden="true" /> 已归档
          </span>
        )}
        <button type="button" className="icon-btn" aria-label={`编辑任务「${task.title}」`} onClick={() => onEdit(task)}>
          <Pencil size={15} aria-hidden="true" />
        </button>
        <button type="button" className="icon-btn icon-btn-danger" aria-label={`删除任务「${task.title}」`} onClick={() => onDelete(task)}>
          <Trash2 size={15} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
