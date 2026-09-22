import { useState } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import type { Task } from './types';
import { useWorkbench, type TaskInput } from './useWorkbench';
import { formatDayTitle, todayKey } from './date';
import { Sidebar, type ViewKey } from './components/Sidebar';
import { TodayView } from './components/TodayView';
import { TasksView } from './components/TasksView';
import { TopicsView } from './components/TopicsView';
import { ExperimentsView } from './components/ExperimentsView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { RightRail } from './components/RightRail';
import { TaskDialog } from './components/TaskDialog';
import { ConfirmDialog } from './components/ConfirmDialog';

type DialogState =
  | { kind: 'create' }
  | { kind: 'edit'; task: Task }
  | { kind: 'delete'; task: Task }
  | null;

const VIEW_TITLE: Record<ViewKey, string> = {
  today: '今日',
  tasks: '任务',
  topics: '内容主题',
  experiments: '实验',
  history: '历史',
  settings: '设置',
};

export default function App() {
  const wb = useWorkbench();
  const { doc, issue, addTask, updateTask, deleteTask, advanceTask, confirmPlan } = wb;
  const [view, setView] = useState<ViewKey>('today');
  const [dialog, setDialog] = useState<DialogState>(null);

  const submitTask = (input: TaskInput) => {
    if (dialog?.kind === 'edit') {
      updateTask(dialog.task.id, input);
    } else {
      addTask(input);
    }
    setDialog(null);
  };

  return (
    <div className={`app-shell${doc.settings.compact ? ' is-compact' : ''}`}>
      <Sidebar view={view} onNavigate={setView} settings={doc.settings} />

      <div className="main-area">
        <header className="topbar">
          <div>
            <h1 className="page-title">
              {view === 'today' ? `今日 · ${formatDayTitle(todayKey())}` : VIEW_TITLE[view]}
            </h1>
            <p className="page-sub">专注当下，持续创作，积累长期价值。</p>
          </div>
          <button type="button" className="btn btn-primary btn-new" onClick={() => setDialog({ kind: 'create' })}>
            <Plus size={16} aria-hidden="true" /> 新建任务
          </button>
        </header>

        {issue && view !== 'settings' && (
          <div className="storage-warning" role="alert">
            <AlertTriangle size={16} aria-hidden="true" />
            <p>{issue.detail} 当前改动不会写入本地，可在「设置」中处理。</p>
          </div>
        )}

        <div className="content-grid">
          <main className="main-col">
            {view === 'today' && (
              <TodayView
                tasks={doc.tasks}
                accounts={doc.accounts}
                history={doc.history}
                settings={doc.settings}
                planConfirmed={doc.planConfirmedOn === todayKey()}
                onConfirmPlan={confirmPlan}
                onAdvance={advanceTask}
                onEdit={(task) => setDialog({ kind: 'edit', task })}
                onDelete={(task) => setDialog({ kind: 'delete', task })}
              />
            )}
            {view === 'tasks' && (
              <TasksView
                tasks={doc.tasks}
                accounts={doc.accounts}
                onAdvance={advanceTask}
                onEdit={(task) => setDialog({ kind: 'edit', task })}
                onDelete={(task) => setDialog({ kind: 'delete', task })}
              />
            )}
            {view === 'topics' && (
              <TopicsView
                topics={doc.topics}
                tasks={doc.tasks}
                onAdd={wb.addTopic}
                onRename={wb.renameTopic}
                onDelete={wb.deleteTopic}
              />
            )}
            {view === 'experiments' && (
              <ExperimentsView
                experiments={doc.experiments}
                onAdd={wb.addExperiment}
                onUpdate={wb.updateExperiment}
                onDelete={wb.deleteExperiment}
                onAdvance={wb.advanceExperiment}
              />
            )}
            {view === 'history' && <HistoryView history={doc.history} accounts={doc.accounts} />}
            {view === 'settings' && (
              <SettingsView
                doc={doc}
                issue={issue}
                onSaveSettings={wb.updateSettings}
                onAddAccount={wb.addAccount}
                onUpdateAccount={wb.updateAccount}
                onSetAccountActive={wb.setAccountActive}
                onImport={wb.importDoc}
                onReset={wb.resetAll}
              />
            )}
          </main>

          <RightRail tasks={doc.tasks} accounts={doc.accounts} onNavigate={setView} onCreateTask={() => setDialog({ kind: 'create' })} />
        </div>
      </div>

      {(dialog?.kind === 'create' || dialog?.kind === 'edit') && (
        <TaskDialog
          accounts={doc.accounts}
          topics={doc.topics}
          initial={dialog.kind === 'edit' ? dialog.task : null}
          onSubmit={submitTask}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          title="删除任务"
          body={`确定删除任务「${dialog.task.title}」吗？此操作不会写入历史，且无法撤销。`}
          confirmLabel="删除"
          onConfirm={() => { deleteTask(dialog.task.id); setDialog(null); }}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
