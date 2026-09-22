import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Account, HistoryRecord } from '../types';
import { formatDayTitle, parseDay, todayKey } from '../date';

type OutcomeFilter = 'all' | HistoryRecord['outcome'];

const OUTCOME_LABEL: Record<HistoryRecord['outcome'], string> = {
  published: '已发布',
  completed: '已完成',
};

const OUTCOME_FILTERS: { key: OutcomeFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'published', label: '已发布' },
  { key: 'completed', label: '已完成' },
];

interface HistoryViewProps {
  history: HistoryRecord[];
  accounts: Account[];
}

/** Completed/published records grouped by local calendar day, searchable. */
export function HistoryView({ history, accounts }: HistoryViewProps) {
  const [query, setQuery] = useState('');
  const [outcome, setOutcome] = useState<OutcomeFilter>('all');
  const [accountId, setAccountId] = useState('all');

  const accountById = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.id, a.name])) as Record<string, string>,
    [accounts],
  );

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = history.filter((h) => {
      if (outcome !== 'all' && h.outcome !== outcome) return false;
      if (accountId !== 'all' && h.accountId !== accountId) return false;
      if (q === '') return true;
      return `${h.title} ${accountById[h.accountId] ?? '未知账号'} ${h.completedOn}`.toLowerCase().includes(q);
    });
    const byDay: Record<string, HistoryRecord[]> = {};
    for (const h of filtered) {
      (byDay[h.completedOn] ??= []).push(h);
    }
    return Object.keys(byDay)
      .sort((a, b) => b.localeCompare(a))
      .map((day) => ({ day, records: byDay[day] }));
  }, [history, accountById, query, outcome, accountId]);

  const dayLabel = (day: string) => {
    const today = todayKey();
    const yesterdayDate = parseDay(today);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;
    const prefix = day === today ? '今天 · ' : day === yesterday ? '昨天 · ' : '';
    return prefix + formatDayTitle(day);
  };

  return (
    <section className="task-section" aria-labelledby="history-title">
      <div className="section-head">
        <h2 id="history-title">历史 <span className="count-badge">{history.length}</span></h2>
        <div className="section-tools">
          <div className="search-box">
            <Search size={15} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索标题、账号或日期…"
              aria-label="搜索历史记录"
            />
          </div>
          <select
            className="plain-select"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            aria-label="按账号筛选"
          >
            <option value="all">全部账号</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-chips" role="group" aria-label="按结果筛选">
        {OUTCOME_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`chip${outcome === f.key ? ' is-active' : ''}`}
            aria-pressed={outcome === f.key}
            onClick={() => setOutcome(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {history.length === 0 && (
        <p className="empty-hint">还没有完成记录。把任务推进到「已完成」后会出现在这里。</p>
      )}
      {history.length > 0 && groups.length === 0 && (
        <p className="empty-hint">没有符合筛选条件的历史记录。</p>
      )}

      {groups.map((g) => (
        <section key={g.day} className="task-group" aria-label={dayLabel(g.day)}>
          <h3 className="group-title history-group-title">
            {dayLabel(g.day)}
            <span className="group-count">{g.records.length}</span>
          </h3>
          <ul className="history-list">
            {g.records.map((h) => (
              <li key={h.id} className="history-row">
                <span className={`status outcome-${h.outcome}`}>{OUTCOME_LABEL[h.outcome]}</span>
                <span className="history-title">{h.title}</span>
                <span className="history-account">{accountById[h.accountId] ?? '未知账号'}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  );
}
