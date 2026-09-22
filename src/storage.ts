import type { WorkbenchDoc } from './types';
import { createSeedDoc } from './seed';

export const STORAGE_KEY = 'sidequest-workbench:v1';
export const SCHEMA_VERSION = 1;

export interface StorageIssue {
  kind: 'malformed' | 'unsupported-version';
  /** Original payload, kept intact for the later Settings recovery UI (export/reset). */
  raw: string;
  detail: string;
}

export interface LoadResult {
  doc: WorkbenchDoc;
  issue: StorageIssue | null;
}

/** Complete runtime validation for untrusted local storage and imports. */
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isId(value: unknown): value is string {
  return isString(value) && value.length > 0
    && value !== '__proto__' && value !== 'constructor' && value !== 'prototype';
}

function isLocalDate(value: unknown): value is string {
  if (!isString(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function isTime(value: unknown): value is string {
  return isString(value) && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isIsoTimestamp(value: unknown): value is string {
  return isString(value)
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
    && !Number.isNaN(Date.parse(value));
}

function validateDoc(v: unknown): v is WorkbenchDoc {
  if (typeof v !== 'object' || v === null || Array.isArray(v)
    || !('schemaVersion' in v && 'tasks' in v && 'accounts' in v && 'topics' in v && 'experiments' in v && 'history' in v && 'settings' in v && 'planConfirmedOn' in v)
    || v.schemaVersion !== SCHEMA_VERSION || !Array.isArray(v.tasks) || !Array.isArray(v.accounts)
    || !Array.isArray(v.topics) || !Array.isArray(v.experiments) || !Array.isArray(v.history)
    || typeof v.settings !== 'object' || v.settings === null || Array.isArray(v.settings)
    || !('displayName' in v.settings && 'motto' in v.settings && 'dailyGoal' in v.settings && 'weeklyGoal' in v.settings && 'weekStartsOn' in v.settings && 'compact' in v.settings)) return false;

  const ids = new Set<string>();
  const accountIds = new Set<string>();
  const topicIds = new Set<string>();
  const hasUniqueId = (id: unknown) => isId(id) && !ids.has(id) && (ids.add(id), true);

  if (!v.accounts.every((account) => {
    if (typeof account !== 'object' || account === null || Array.isArray(account)
      || !('id' in account && 'name' in account && 'platform' in account && 'color' in account && 'active' in account)
      || !hasUniqueId(account.id) || !isString(account.name) || !isString(account.platform) || !isString(account.color)
      || !/^#[0-9a-fA-F]{6}$/.test(account.color) || typeof account.active !== 'boolean') return false;
    accountIds.add(account.id);
    return true;
  }) || accountIds.size === 0 || !v.accounts.some((account) =>
    typeof account === 'object' && account !== null && !Array.isArray(account) && 'active' in account && account.active === true,
  )) return false;

  if (!v.topics.every((topic) => {
    if (typeof topic !== 'object' || topic === null || Array.isArray(topic)
      || !('id' in topic && 'name' in topic) || !hasUniqueId(topic.id) || !isString(topic.name)) return false;
    topicIds.add(topic.id);
    return true;
  })) return false;

  if (!v.tasks.every((task) => {
    if (typeof task !== 'object' || task === null || Array.isArray(task)
      || !('id' in task && 'title' in task && 'note' in task && 'accountId' in task && 'topicId' in task && 'priority' in task && 'status' in task && 'plannedDate' in task && 'plannedTime' in task && 'createdAt' in task && 'completedAt' in task)) return false;
    return hasUniqueId(task.id) && isString(task.title) && isString(task.note) && isId(task.accountId) && accountIds.has(task.accountId)
      && (task.topicId === null || (isId(task.topicId) && topicIds.has(task.topicId)))
      && (task.priority === 'high' || task.priority === 'medium' || task.priority === 'low')
      && (task.status === 'draft' || task.status === 'capture' || task.status === 'editing' || task.status === 'review' || task.status === 'done')
      && isLocalDate(task.plannedDate) && (task.plannedTime === null || isTime(task.plannedTime))
      && isIsoTimestamp(task.createdAt) && (task.completedAt === null || isIsoTimestamp(task.completedAt));
  })) return false;

  if (!v.experiments.every((experiment) => {
    if (typeof experiment !== 'object' || experiment === null || Array.isArray(experiment)
      || !('id' in experiment && 'title' in experiment && 'hypothesis' in experiment && 'metric' in experiment && 'status' in experiment && 'conclusion' in experiment)) return false;
    return hasUniqueId(experiment.id) && isString(experiment.title) && isString(experiment.hypothesis) && isString(experiment.metric) && isString(experiment.conclusion)
      && (experiment.status === 'idea' || experiment.status === 'running' || experiment.status === 'done');
  })) return false;

  if (!v.history.every((record) => {
    if (typeof record !== 'object' || record === null || Array.isArray(record)
      || !('id' in record && 'title' in record && 'accountId' in record && 'completedOn' in record && 'outcome' in record)) return false;
    return hasUniqueId(record.id) && isString(record.title) && isId(record.accountId) && accountIds.has(record.accountId)
      && isLocalDate(record.completedOn) && (record.outcome === 'published' || record.outcome === 'completed');
  })) return false;

  return isString(v.settings.displayName) && isString(v.settings.motto)
    && typeof v.settings.dailyGoal === 'number' && Number.isFinite(v.settings.dailyGoal)
    && typeof v.settings.weeklyGoal === 'number' && Number.isFinite(v.settings.weeklyGoal)
    && (v.settings.weekStartsOn === 0 || v.settings.weekStartsOn === 1) && typeof v.settings.compact === 'boolean'
    && (v.planConfirmedOn === null || isLocalDate(v.planConfirmedOn));
}

function readSchemaVersion(v: unknown): number | null {
  if (typeof v !== 'object' || v === null || !('schemaVersion' in v)) return null;
  return typeof v.schemaVersion === 'number' ? v.schemaVersion : null;
}


export type ImportResult = { ok: true; doc: WorkbenchDoc } | { ok: false; error: string };

/**
 * Validate a JSON text for import. Same rules as the persistence boundary:
 * schemaVersion is authoritative; future versions and broken shapes are rejected.
 */
export function parseWorkbenchJson(raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: '文件不是有效的 JSON，未导入。' };
  }
  const version = readSchemaVersion(parsed);
  if (version !== null && version > SCHEMA_VERSION) {
    return { ok: false, error: `文件版本（schemaVersion ${version}）高于当前支持的 ${SCHEMA_VERSION}，未导入。` };
  }
  if (!validateDoc(parsed)) {
    return { ok: false, error: '文件缺少必要字段或结构不完整，未导入。' };
  }
  return { ok: true, doc: parsed };
}
/**
 * Load the versioned document.
 * - Key absent: write the seed and return it.
 * - Malformed JSON / failed validation / unsupported version: fall back to an
 *   in-memory seed WITHOUT touching the original key, and report the issue so
 *   the later Settings UI can offer raw export + explicit reset.
 */
export function loadWorkbench(): LoadResult {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }

  if (raw === null) {
    const seed = createSeedDoc();
    persist(seed);
    return { doc: seed, issue: null };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      doc: createSeedDoc(),
      issue: { kind: 'malformed', raw, detail: '本地数据不是有效的 JSON，已在内存中回退到演示数据，原始内容未被改动。' },
    };
  }

  const version = readSchemaVersion(parsed);
  if (version !== null && version > SCHEMA_VERSION) {
    return {
      doc: createSeedDoc(),
      issue: {
        kind: 'unsupported-version', raw,
        detail: `本地数据版本（schemaVersion ${version}）高于当前支持的 ${SCHEMA_VERSION}，已在内存中回退，原始内容未被改动。`,
      },
    };
  }

  if (!validateDoc(parsed)) {
    return {
      doc: createSeedDoc(),
      issue: { kind: 'malformed', raw, detail: '本地数据结构不完整或版本不受支持，已在内存中回退到演示数据，原始内容未被改动。' },
    };
  }

  return { doc: parsed, issue: null };
}

/** Persist the document. Never call this while a StorageIssue is active. */
export function persist(doc: WorkbenchDoc): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
  } catch {
    // Quota or privacy-mode failure: keep the in-memory state; nothing else to do locally.
  }
}
