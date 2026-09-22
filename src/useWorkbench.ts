import { useEffect, useState } from 'react';
import type { Account, Experiment, Settings, Task, TaskStatus, WorkbenchDoc } from './types';
import { TASK_STATUSES } from './types';
import { loadWorkbench, persist, type StorageIssue } from './storage';
import { createSeedDoc } from './seed';
import { todayKey, uid } from './date';

export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'completedAt'>;
export type ExperimentInput = Omit<Experiment, 'id'>;
export type AccountInput = Omit<Account, 'id' | 'active'>;

export interface Workbench {
  doc: WorkbenchDoc;
  issue: StorageIssue | null;
  addTask: (input: TaskInput) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  advanceTask: (id: string) => void;
  confirmPlan: () => void;
  addTopic: (name: string) => void;
  renameTopic: (id: string, name: string) => void;
  /** Delete a topic. Only call for topics with no linked tasks. */
  deleteTopic: (id: string) => void;
  addExperiment: (input: ExperimentInput) => void;
  updateExperiment: (id: string, patch: Partial<Experiment>) => void;
  deleteExperiment: (id: string) => void;
  advanceExperiment: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  addAccount: (input: AccountInput) => void;
  updateAccount: (id: string, patch: Partial<AccountInput>) => void;
  /** Activate/deactivate. Deactivating the last active account is a no-op. */
  setAccountActive: (id: string, active: boolean) => void;
  /** Replace the whole document with an already-validated import. */
  importDoc: (imported: WorkbenchDoc) => void;
  /** Explicit reset to demo data; also the recovery path for a storage issue. */
  resetAll: () => void;
}

/**
 * The single top-level state owner. All views receive doc + callbacks as props;
 * no component keeps its own copy of workbench data.
 */
export function useWorkbench(): Workbench {
  const [state] = useState(loadWorkbench);
  const [doc, setDoc] = useState(state.doc);
  // The load-time issue is mutable so explicit import/reset can clear it.
  const [issue, setIssue] = useState(state.issue);

  useEffect(() => {
    // While a storage issue is active the original key must stay untouched.
    if (issue === null) persist(doc);
  }, [doc, issue]);

  const patchTask = (id: string, patch: Partial<Task>) =>
    setDoc((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));

  const replaceDoc = (next: WorkbenchDoc) => {
    setDoc(next);
    setIssue(null);
  };

  return {
    doc,
    issue,
    addTask: (input) =>
      setDoc((d) => ({
        ...d,
        tasks: [...d.tasks, { ...input, id: uid(), createdAt: new Date().toISOString(), completedAt: null }],
      })),
    updateTask: patchTask,
    deleteTask: (id) => setDoc((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) })),
    advanceTask: (id) =>
      setDoc((d) => {
        const task = d.tasks.find((t) => t.id === id);
        if (!task) return d;
        const next: TaskStatus | null = TASK_STATUSES[TASK_STATUSES.indexOf(task.status) + 1] ?? null;
        if (next === null) return d;
        if (next !== 'done') return { ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, status: next } : t)) };
        const completedAt = new Date().toISOString();
        return {
          ...d,
          tasks: d.tasks.map((t) => (t.id === id ? { ...t, status: 'done', completedAt } : t)),
          history: [
            { id: uid(), title: task.title, accountId: task.accountId, completedOn: todayKey(), outcome: 'published' },
            ...d.history,
          ],
        };
      }),
    confirmPlan: () => setDoc((d) => ({ ...d, planConfirmedOn: todayKey() })),

    addTopic: (name) =>
      setDoc((d) => ({ ...d, topics: [...d.topics, { id: uid(), name }] })),
    renameTopic: (id, name) =>
      setDoc((d) => ({ ...d, topics: d.topics.map((t) => (t.id === id ? { ...t, name } : t)) })),
    deleteTopic: (id) =>
      setDoc((d) =>
        d.tasks.some((t) => t.topicId === id)
          ? d
          : { ...d, topics: d.topics.filter((t) => t.id !== id) },
      ),

    addExperiment: (input) =>
      setDoc((d) => ({ ...d, experiments: [{ ...input, id: uid() }, ...d.experiments] })),
    updateExperiment: (id, patch) =>
      setDoc((d) => ({ ...d, experiments: d.experiments.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
    deleteExperiment: (id) =>
      setDoc((d) => ({ ...d, experiments: d.experiments.filter((e) => e.id !== id) })),
    advanceExperiment: (id) =>
      setDoc((d) => ({
        ...d,
        experiments: d.experiments.map((e) => {
          if (e.id !== id) return e;
          const next = e.status === 'idea' ? 'running' : e.status === 'running' ? 'done' : null;
          return next === null ? e : { ...e, status: next };
        }),
      })),

    updateSettings: (patch) => setDoc((d) => ({ ...d, settings: { ...d.settings, ...patch } })),

    addAccount: (input) =>
      setDoc((d) => ({ ...d, accounts: [...d.accounts, { ...input, id: uid(), active: true }] })),
    updateAccount: (id, patch) =>
      setDoc((d) => ({ ...d, accounts: d.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
    setAccountActive: (id, active) =>
      setDoc((d) => {
        // The task form needs at least one active account to remain usable.
        if (!active && d.accounts.filter((a) => a.active).length <= 1) return d;
        return { ...d, accounts: d.accounts.map((a) => (a.id === id ? { ...a, active } : a)) };
      }),

    importDoc: (imported) => replaceDoc(imported),
    resetAll: () => replaceDoc(createSeedDoc()),
  };
}
