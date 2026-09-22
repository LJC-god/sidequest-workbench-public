import { useRef, useState } from 'react';
import { AlertTriangle, Download, Pencil, Plus, Upload } from 'lucide-react';
import type { Account, Settings, WorkbenchDoc } from '../types';
import type { AccountInput } from '../useWorkbench';
import type { StorageIssue } from '../storage';
import { parseWorkbenchJson } from '../storage';
import { todayKey } from '../date';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';

/** Trigger a browser download of a text payload. */
function downloadText(filename: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface PreferencesFormProps {
  settings: Settings;
  onSave: (patch: Settings) => void;
  onDirty: () => void;
}

/** Personal preferences; local draft state until explicitly saved. */
function PreferencesForm({ settings, onSave, onDirty }: PreferencesFormProps) {
  const [displayName, setDisplayName] = useState(settings.displayName);
  const [motto, setMotto] = useState(settings.motto);
  const [dailyGoal, setDailyGoal] = useState(String(settings.dailyGoal));
  const [weeklyGoal, setWeeklyGoal] = useState(String(settings.weeklyGoal));
  const [weekStartsOn, setWeekStartsOn] = useState(settings.weekStartsOn);
  const [compact, setCompact] = useState(settings.compact);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const daily = Number(dailyGoal);
    const weekly = Number(weeklyGoal);
    if (displayName.trim() === '') {
      setError('请填写个人名称');
      document.getElementById('pref-name')?.focus();
      return;
    }
    if (!Number.isInteger(daily) || daily < 1 || !Number.isInteger(weekly) || weekly < 1) {
      setError('每日目标与每周目标需为不小于 1 的整数');
      return;
    }
    setError('');
    onSave({
      displayName: displayName.trim(),
      motto: motto.trim(),
      dailyGoal: daily,
      weeklyGoal: weekly,
      weekStartsOn,
      compact,
    });
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="field-grid">
        <div className="field">
          <label htmlFor="pref-name">个人名称 <span aria-hidden="true" className="req">*</span></label>
          <input
            id="pref-name"
            value={displayName}
            onChange={(e) => { setDisplayName(e.target.value); onDirty(); }}
            aria-required="true"
          />
        </div>
        <div className="field">
          <label htmlFor="pref-motto">签名</label>
          <input id="pref-motto" value={motto} onChange={(e) => { setMotto(e.target.value); onDirty(); }} />
        </div>
        <div className="field">
          <label htmlFor="pref-daily">每日目标（件）</label>
          <input
            id="pref-daily" type="number" min={1} step={1}
            value={dailyGoal}
            onChange={(e) => { setDailyGoal(e.target.value); onDirty(); }}
          />
        </div>
        <div className="field">
          <label htmlFor="pref-weekly">每周目标（件）</label>
          <input
            id="pref-weekly" type="number" min={1} step={1}
            value={weeklyGoal}
            onChange={(e) => { setWeeklyGoal(e.target.value); onDirty(); }}
          />
        </div>
        <div className="field">
          <label htmlFor="pref-weekstart">一周开始于</label>
          <select
            id="pref-weekstart"
            value={weekStartsOn}
            onChange={(e) => { setWeekStartsOn(Number(e.target.value) === 1 ? 1 : 0); onDirty(); }}
          >
            <option value={1}>周一</option>
            <option value={0}>周日</option>
          </select>
        </div>
        <div className="field field-check">
          <input
            id="pref-compact" type="checkbox"
            checked={compact}
            onChange={(e) => { setCompact(e.target.checked); onDirty(); }}
          />
          <label htmlFor="pref-compact">紧凑模式（缩小间距与行高）</label>
        </div>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">保存偏好</button>
      </div>
    </form>
  );
}

interface AccountDialogProps {
  initial: Account | null;
  onSubmit: (input: AccountInput) => void;
  onClose: () => void;
}

function AccountDialog({ initial, onSubmit, onClose }: AccountDialogProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [platform, setPlatform] = useState(initial?.platform ?? '');
  const [color, setColor] = useState(initial?.color ?? '#3e6b4f');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '') {
      setError('请填写账号名称');
      document.getElementById('account-name')?.focus();
      return;
    }
    onSubmit({ name: name.trim(), platform: platform.trim(), color });
  };

  return (
    <Modal labelledBy="account-dialog-title" onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <h2 id="account-dialog-title" className="modal-title">{initial ? '编辑账号' : '新增账号'}</h2>
        <div className="field">
          <label htmlFor="account-name">账号名称 <span aria-hidden="true" className="req">*</span></label>
          <input
            id="account-name"
            value={name}
            onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
            aria-required="true"
            aria-invalid={error !== ''}
            aria-describedby={error ? 'account-name-error' : undefined}
            placeholder="例如：英语主账号"
          />
          {error && <p id="account-name-error" className="field-error" role="alert">{error}</p>}
        </div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="account-platform">平台</label>
            <input
              id="account-platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="例如：公众号"
            />
          </div>
          <div className="field">
            <label htmlFor="account-color">标识颜色</label>
            <input
              id="account-color" type="color" className="color-input"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>取消</button>
          <button type="submit" className="btn btn-primary">{initial ? '保存修改' : '创建账号'}</button>
        </div>
      </form>
    </Modal>
  );
}

type AccountDialogState = { kind: 'create' } | { kind: 'edit'; account: Account } | null;
type PendingImport = { doc: WorkbenchDoc; fileName: string } | null;

interface SettingsViewProps {
  doc: WorkbenchDoc;
  issue: StorageIssue | null;
  onSaveSettings: (patch: Settings) => void;
  onAddAccount: (input: AccountInput) => void;
  onUpdateAccount: (id: string, patch: Partial<AccountInput>) => void;
  onSetAccountActive: (id: string, active: boolean) => void;
  onImport: (imported: WorkbenchDoc) => void;
  onReset: () => void;
}

/** Preferences, minimal account management, and local data export/import/reset. */
export function SettingsView(props: SettingsViewProps) {
  const { doc, issue, onSaveSettings, onAddAccount, onUpdateAccount, onSetAccountActive, onImport, onReset } = props;
  const [accountDialog, setAccountDialog] = useState<AccountDialogState>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<PendingImport>(null);
  const [dataMessage, setDataMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [prefMessage, setPrefMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const importButtonRef = useRef<HTMLButtonElement>(null);

  const activeCount = doc.accounts.filter((a) => a.active).length;

  const importFile = async (file: File) => {
    try {
      const result = parseWorkbenchJson(await file.text());
      if (result.ok) {
        setPendingImport({ doc: result.doc, fileName: file.name });
        setDataMessage(null);
      } else {
        setDataMessage({ kind: 'error', text: `导入失败：${result.error} 当前数据未被改动。` });
      }
    } catch {
      setDataMessage({ kind: 'error', text: '导入失败：无法读取文件，当前数据未被改动。' });
    }
  };

  const closePendingImport = () => {
    setPendingImport(null);
    requestAnimationFrame(() => importButtonRef.current?.focus());
  };

  return (
    <div className="settings-view">
      {issue && (
        <section className="task-section settings-section" aria-labelledby="recovery-title">
          <h2 id="recovery-title" className="settings-heading">本地数据异常</h2>
          <div className="storage-warning" role="alert">
            <AlertTriangle size={16} aria-hidden="true" />
            <div>
              <p>{issue.detail}</p>
              <p className="settings-muted">
                原始载荷仍完整保留在浏览器本地（{issue.raw.length} 字符），当前改动不会写入。
                你可以下载原始数据人工备份，或显式重置为演示数据（会覆盖原始载荷）。
              </p>
            </div>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => downloadText(`sidequest-workbench-raw-${todayKey()}.txt`, issue.raw, 'text/plain')}
            >
              <Download size={15} aria-hidden="true" /> 下载原始数据
            </button>
            <button type="button" className="btn btn-danger" onClick={() => setResetOpen(true)}>
              重置为演示数据
            </button>
          </div>
        </section>
      )}

      <section className="task-section settings-section" aria-labelledby="pref-title">
        <h2 id="pref-title" className="settings-heading">个人偏好</h2>
        <PreferencesForm
          key={JSON.stringify(doc.settings)}
          settings={doc.settings}
          onSave={(patch) => { onSaveSettings(patch); setPrefMessage('已保存。'); }}
          onDirty={() => setPrefMessage('')}
        />
        <p className="form-status" aria-live="polite">{prefMessage}</p>
      </section>

      <section className="task-section settings-section" aria-labelledby="accounts-title">
        <div className="section-head">
          <h2 id="accounts-title" className="settings-heading">账号管理 <span className="count-badge">{doc.accounts.length}</span></h2>
          <button type="button" className="btn btn-primary" onClick={() => setAccountDialog({ kind: 'create' })}>
            <Plus size={15} aria-hidden="true" /> 新增账号
          </button>
        </div>
        <ul className="account-list">
          {doc.accounts.map((a) => {
            const isLastActive = a.active && activeCount <= 1;
            return (
              <li key={a.id} className={`account-row${a.active ? '' : ' is-inactive'}`}>
                <span className="account-dot" style={{ background: a.color }} aria-hidden="true" />
                <div className="account-info">
                  <p className="account-row-name">{a.name}</p>
                  <p className="account-row-meta">
                    {a.platform || '未设置平台'} · {a.active ? '使用中' : '已停用'}
                  </p>
                </div>
                <div className="account-row-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={isLastActive}
                    title={isLastActive ? '至少保留一个使用中的账号' : undefined}
                    aria-label={isLastActive ? `账号「${a.name}」是最后一个使用中的账号，不能停用` : a.active ? `停用账号「${a.name}」` : `启用账号「${a.name}」`}
                    onClick={() => onSetAccountActive(a.id, !a.active)}
                  >
                    {a.active ? '停用' : '启用'}
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`编辑账号「${a.name}」`}
                    onClick={() => setAccountDialog({ kind: 'edit', account: a })}
                  >
                    <Pencil size={15} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="settings-muted">新建任务时只能关联使用中的账号；已停用账号仍保留在现有任务与历史中。</p>
      </section>

      <section className="task-section settings-section" aria-labelledby="data-title">
        <h2 id="data-title" className="settings-heading">数据管理</h2>
        <p className="settings-muted">
          全部数据仅保存在当前浏览器的 localStorage（键名 sidequest-workbench:v1，schemaVersion 1）。
          导出为 JSON 文件；导入会先用同一套结构校验，失败不会改动当前数据。
        </p>
        <div className="form-actions data-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => downloadText(`sidequest-workbench-${todayKey()}.json`, JSON.stringify(doc, null, 2), 'application/json')}
          >
            <Download size={15} aria-hidden="true" /> 导出 JSON
          </button>
          <button ref={importButtonRef} type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            <Upload size={15} aria-hidden="true" /> 导入 JSON…
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            aria-label="选择要导入的 JSON 文件"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importFile(file);
              e.target.value = '';
            }}
          />
          {!issue && (
            <button type="button" className="btn btn-danger" onClick={() => setResetOpen(true)}>
              重置为演示数据
            </button>
          )}
        </div>
        <p
          className={`form-status${dataMessage?.kind === 'error' ? ' field-error' : ''}`}
          aria-live="polite"
          role={dataMessage?.kind === 'error' ? 'alert' : undefined}
        >
          {dataMessage?.text ?? ''}
        </p>
      </section>

      {accountDialog && (
        <AccountDialog
          initial={accountDialog.kind === 'edit' ? accountDialog.account : null}
          onSubmit={(input) => {
            if (accountDialog.kind === 'edit') onUpdateAccount(accountDialog.account.id, input);
            else onAddAccount(input);
            setAccountDialog(null);
          }}
          onClose={() => setAccountDialog(null)}
        />
      )}
      {resetOpen && (
        <ConfirmDialog
          title="重置本地数据"
          body="确定重置吗？当前所有任务、主题、实验、历史与设置将被演示数据替换，此操作无法撤销。"
          confirmLabel="重置"
          onConfirm={() => { onReset(); setResetOpen(false); setDataMessage({ kind: 'ok', text: '已重置为演示数据。' }); }}
          onClose={() => setResetOpen(false)}
        />
      )}
      {pendingImport && (
        <ConfirmDialog
          title="确认导入并替换全部数据"
          body={`确定导入「${pendingImport.fileName}」吗？所有任务、主题、实验、历史与设置都将被替换，此操作无法撤销。`}
          confirmLabel="确认导入"
          onConfirm={() => {
            onImport(pendingImport.doc);
            closePendingImport();
            setDataMessage({ kind: 'ok', text: `已导入「${pendingImport.fileName}」，全部数据已替换为文件内容。` });
          }}
          onClose={closePendingImport}
        />
      )}
    </div>
  );
}
