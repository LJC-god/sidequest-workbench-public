import { useState } from 'react';
import type { Account, Priority, Task, TaskStatus, Topic } from '../types';
import { PRIORITY_LABEL, STATUS_LABEL, TASK_STATUSES } from '../types';
import type { TaskInput } from '../useWorkbench';
import { todayKey } from '../date';
import { Modal } from './Modal';

interface TaskDialogProps {
  accounts: Account[];
  topics: Topic[];
  /** null → create mode; otherwise edit mode. */
  initial: Task | null;
  onSubmit: (input: TaskInput) => void;
  onClose: () => void;
}

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

export function TaskDialog({ accounts, topics, initial, onSubmit, onClose }: TaskDialogProps) {
  // Edit mode keeps a deactivated account selectable so existing links survive.
  const activeAccounts = accounts.filter((a) => a.active);
  const initialAccount = initial ? accounts.find((a) => a.id === initial.accountId) : undefined;
  const selectableAccounts =
    initialAccount && !initialAccount.active ? [...activeAccounts, initialAccount] : activeAccounts;
  const [title, setTitle] = useState(initial?.title ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [accountId, setAccountId] = useState(initial?.accountId ?? activeAccounts[0]?.id ?? '');
  const [topicId, setTopicId] = useState(initial?.topicId ?? '');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium');
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'draft');
  const [plannedDate, setPlannedDate] = useState(initial?.plannedDate ?? todayKey());
  const [plannedTime, setPlannedTime] = useState(initial?.plannedTime ?? '');
  const [titleError, setTitleError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '') {
      setTitleError('请填写任务标题');
      document.getElementById('task-title')?.focus();
      return;
    }
    onSubmit({
      title: title.trim(),
      note: note.trim(),
      accountId,
      topicId: topicId === '' ? null : topicId,
      priority,
      status,
      plannedDate,
      plannedTime: plannedTime === '' ? null : plannedTime,
    });
  };

  return (
    <Modal labelledBy="task-dialog-title" onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <h2 id="task-dialog-title" className="modal-title">{initial ? '编辑任务' : '新建任务'}</h2>

        <div className="field">
          <label htmlFor="task-title">任务标题 <span aria-hidden="true" className="req">*</span></label>
          <input
            id="task-title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError(''); }}
            aria-required="true"
            aria-invalid={titleError !== ''}
            aria-describedby={titleError ? 'task-title-error' : undefined}
            placeholder="例如：雅思口语开头怎么背"
          />
          {titleError && <p id="task-title-error" className="field-error" role="alert">{titleError}</p>}
        </div>

        <div className="field">
          <label htmlFor="task-note">备注</label>
          <input id="task-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="一句话说明要做什么" />
        </div>

        <div className="field-grid">
          <div className="field">
            <label htmlFor="task-account">关联账号</label>
            <select id="task-account" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {selectableAccounts.map((a) => (
                <option key={a.id} value={a.id}>{a.active ? a.name : `${a.name}（已停用）`}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-topic">内容主题</label>
            <select id="task-topic" value={topicId} onChange={(e) => setTopicId(e.target.value)}>
              <option value="">不关联</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-priority">优先级</label>
            <select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-status">状态</label>
            <select id="task-status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-date">计划日期</label>
            <input id="task-date" type="date" value={plannedDate} onChange={(e) => setPlannedDate(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="task-time">计划时间（可选）</label>
            <input id="task-time" type="time" value={plannedTime} onChange={(e) => setPlannedTime(e.target.value)} />
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>取消</button>
          <button type="submit" className="btn btn-primary">{initial ? '保存修改' : '创建任务'}</button>
        </div>
      </form>
    </Modal>
  );
}
