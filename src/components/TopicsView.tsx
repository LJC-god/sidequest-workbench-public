import { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import type { Task, Topic } from '../types';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';

type DialogState =
  | { kind: 'create' }
  | { kind: 'rename'; topic: Topic }
  | { kind: 'delete'; topic: Topic }
  | null;

interface TopicDialogProps {
  initial: Topic | null;
  onSubmit: (name: string) => void;
  onClose: () => void;
}

/** Single-field dialog used for both creating and renaming a topic. */
function TopicDialog({ initial, onSubmit, onClose }: TopicDialogProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '') {
      setError('请填写主题名称');
      document.getElementById('topic-name')?.focus();
      return;
    }
    onSubmit(name.trim());
  };

  return (
    <Modal labelledBy="topic-dialog-title" onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <h2 id="topic-dialog-title" className="modal-title">{initial ? '重命名主题' : '新增主题'}</h2>
        <div className="field">
          <label htmlFor="topic-name">主题名称 <span aria-hidden="true" className="req">*</span></label>
          <input
            id="topic-name"
            value={name}
            onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
            aria-required="true"
            aria-invalid={error !== ''}
            aria-describedby={error ? 'topic-name-error' : undefined}
            placeholder="例如：雅思口语"
          />
          {error && <p id="topic-name-error" className="field-error" role="alert">{error}</p>}
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>取消</button>
          <button type="submit" className="btn btn-primary">{initial ? '保存' : '创建主题'}</button>
        </div>
      </form>
    </Modal>
  );
}

interface TopicsViewProps {
  topics: Topic[];
  tasks: Task[];
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

/** Topic cards with linked-task counts; search, create, rename, safe delete. */
export function TopicsView({ topics, tasks, onAdd, onRename, onDelete }: TopicsViewProps) {
  const [query, setQuery] = useState('');
  const [dialog, setDialog] = useState<DialogState>(null);

  const countOf = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tasks) {
      if (t.topicId) counts[t.topicId] = (counts[t.topicId] ?? 0) + 1;
    }
    return counts;
  }, [tasks]);

  const q = query.trim().toLowerCase();
  const visible = q === '' ? topics : topics.filter((t) => t.name.toLowerCase().includes(q));

  return (
    <section className="task-section" aria-labelledby="topics-title">
      <div className="section-head">
        <h2 id="topics-title">内容主题 <span className="count-badge">{visible.length}</span></h2>
        <div className="section-tools">
          <div className="search-box">
            <Search size={15} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索主题…"
              aria-label="搜索内容主题"
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setDialog({ kind: 'create' })}>
            <Plus size={15} aria-hidden="true" /> 新增主题
          </button>
        </div>
      </div>

      {topics.length === 0 && <p className="empty-hint">还没有主题。点击「新增主题」创建第一个内容方向。</p>}
      {topics.length > 0 && visible.length === 0 && <p className="empty-hint">没有符合搜索的主题。</p>}

      <ul className="topic-grid">
        {visible.map((t) => {
          const count = countOf[t.id] ?? 0;
          const deletable = count === 0;
          return (
            <li key={t.id} className="topic-card">
              <div className="topic-card-main">
                <p className="topic-name">{t.name}</p>
                <p className="topic-count">{count} 个关联任务</p>
              </div>
              <div className="topic-card-actions">
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`重命名主题「${t.name}」`}
                  onClick={() => setDialog({ kind: 'rename', topic: t })}
                >
                  <Pencil size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="icon-btn icon-btn-danger"
                  aria-label={deletable ? `删除主题「${t.name}」` : `主题「${t.name}」有 ${count} 个关联任务，不能删除`}
                  disabled={!deletable}
                  onClick={() => setDialog({ kind: 'delete', topic: t })}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {(dialog?.kind === 'create' || dialog?.kind === 'rename') && (
        <TopicDialog
          initial={dialog.kind === 'rename' ? dialog.topic : null}
          onSubmit={(name) => {
            if (dialog.kind === 'rename') onRename(dialog.topic.id, name);
            else onAdd(name);
            setDialog(null);
          }}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          title="删除主题"
          body={`确定删除主题「${dialog.topic.name}」吗？此操作无法撤销。`}
          confirmLabel="删除"
          onConfirm={() => { onDelete(dialog.topic.id); setDialog(null); }}
          onClose={() => setDialog(null)}
        />
      )}
    </section>
  );
}
