import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { Experiment, ExperimentStatus } from '../types';
import { EXPERIMENT_NEXT_LABEL, EXPERIMENT_STATUS_LABEL, EXPERIMENT_STATUSES } from '../types';
import type { ExperimentInput } from '../useWorkbench';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';

interface ExperimentDialogProps {
  initial: Experiment | null;
  onSubmit: (input: ExperimentInput) => void;
  onClose: () => void;
}

function ExperimentDialog({ initial, onSubmit, onClose }: ExperimentDialogProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [hypothesis, setHypothesis] = useState(initial?.hypothesis ?? '');
  const [metric, setMetric] = useState(initial?.metric ?? '');
  const [status, setStatus] = useState<ExperimentStatus>(initial?.status ?? 'idea');
  const [conclusion, setConclusion] = useState(initial?.conclusion ?? '');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '') {
      setError('请填写实验标题');
      document.getElementById('exp-title')?.focus();
      return;
    }
    onSubmit({
      title: title.trim(),
      hypothesis: hypothesis.trim(),
      metric: metric.trim(),
      status,
      conclusion: conclusion.trim(),
    });
  };

  return (
    <Modal labelledBy="exp-dialog-title" onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <h2 id="exp-dialog-title" className="modal-title">{initial ? '编辑实验' : '新增实验'}</h2>

        <div className="field">
          <label htmlFor="exp-title">实验标题 <span aria-hidden="true" className="req">*</span></label>
          <input
            id="exp-title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (error) setError(''); }}
            aria-required="true"
            aria-invalid={error !== ''}
            aria-describedby={error ? 'exp-title-error' : undefined}
            placeholder="例如：封面风格 A/B"
          />
          {error && <p id="exp-title-error" className="field-error" role="alert">{error}</p>}
        </div>

        <div className="field">
          <label htmlFor="exp-hypothesis">假设</label>
          <textarea
            id="exp-hypothesis"
            rows={2}
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
            placeholder="你认为会发生什么？例如：手写体封面点击率高于模板体"
          />
        </div>

        <div className="field-grid">
          <div className="field">
            <label htmlFor="exp-metric">观察指标</label>
            <input
              id="exp-metric"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              placeholder="例如：48 小时点击率"
            />
          </div>
          <div className="field">
            <label htmlFor="exp-status">状态</label>
            <select id="exp-status" value={status} onChange={(e) => setStatus(e.target.value as ExperimentStatus)}>
              {EXPERIMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{EXPERIMENT_STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="exp-conclusion">结论{status === 'done' ? '（完成后建议填写）' : ''}</label>
          <textarea
            id="exp-conclusion"
            rows={2}
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            placeholder="实验结束后记录结论，例如：手写体点击率高 18%，全量采用"
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>取消</button>
          <button type="submit" className="btn btn-primary">{initial ? '保存修改' : '创建实验'}</button>
        </div>
      </form>
    </Modal>
  );
}

type DialogState =
  | { kind: 'create' }
  | { kind: 'edit'; experiment: Experiment }
  | { kind: 'delete'; experiment: Experiment }
  | null;

interface ExperimentsViewProps {
  experiments: Experiment[];
  onAdd: (input: ExperimentInput) => void;
  onUpdate: (id: string, patch: Partial<Experiment>) => void;
  onDelete: (id: string) => void;
  onAdvance: (id: string) => void;
}

/** Experiment log: hypothesis, metric, status progression and conclusion. */
export function ExperimentsView({ experiments, onAdd, onUpdate, onDelete, onAdvance }: ExperimentsViewProps) {
  const [dialog, setDialog] = useState<DialogState>(null);

  return (
    <section className="task-section" aria-labelledby="experiments-title">
      <div className="section-head">
        <h2 id="experiments-title">实验 <span className="count-badge">{experiments.length}</span></h2>
        <div className="section-tools">
          <button type="button" className="btn btn-primary" onClick={() => setDialog({ kind: 'create' })}>
            <Plus size={15} aria-hidden="true" /> 新增实验
          </button>
        </div>
      </div>

      {experiments.length === 0 && (
        <p className="empty-hint">还没有实验。把想验证的想法记下来，推进状态并记录结论。</p>
      )}

      <ul className="exp-list">
        {experiments.map((exp) => {
          const nextLabel = EXPERIMENT_NEXT_LABEL[exp.status];
          return (
            <li key={exp.id} className={`exp-card is-${exp.status}`}>
              <div className="exp-head">
                <p className="exp-title">{exp.title}</p>
                <span className={`status exp-status-${exp.status}`}>{EXPERIMENT_STATUS_LABEL[exp.status]}</span>
              </div>
              {exp.hypothesis && <p className="exp-line"><span className="exp-label">假设</span>{exp.hypothesis}</p>}
              {exp.metric && <p className="exp-line"><span className="exp-label">指标</span>{exp.metric}</p>}
              {exp.status === 'done' && (
                <p className="exp-line">
                  <span className="exp-label">结论</span>
                  {exp.conclusion === '' ? <span className="exp-conclusion-missing">尚未填写结论，点击编辑补充。</span> : exp.conclusion}
                </p>
              )}
              <div className="exp-actions">
                {nextLabel && (
                  <button type="button" className="btn btn-next" onClick={() => onAdvance(exp.id)}>
                    {nextLabel}
                  </button>
                )}
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`编辑实验「${exp.title}」`}
                  onClick={() => setDialog({ kind: 'edit', experiment: exp })}
                >
                  <Pencil size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="icon-btn icon-btn-danger"
                  aria-label={`删除实验「${exp.title}」`}
                  onClick={() => setDialog({ kind: 'delete', experiment: exp })}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {(dialog?.kind === 'create' || dialog?.kind === 'edit') && (
        <ExperimentDialog
          initial={dialog.kind === 'edit' ? dialog.experiment : null}
          onSubmit={(input) => {
            if (dialog.kind === 'edit') onUpdate(dialog.experiment.id, input);
            else onAdd(input);
            setDialog(null);
          }}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          title="删除实验"
          body={`确定删除实验「${dialog.experiment.title}」吗？此操作无法撤销。`}
          confirmLabel="删除"
          onConfirm={() => { onDelete(dialog.experiment.id); setDialog(null); }}
          onClose={() => setDialog(null)}
        />
      )}
    </section>
  );
}
