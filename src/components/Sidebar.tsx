import { CalendarDays, ClipboardList, FlaskConical, History, Home, Leaf, Lightbulb, Settings } from 'lucide-react';
import type { Settings as SettingsDoc } from '../types';

export type ViewKey = 'today' | 'tasks' | 'topics' | 'experiments' | 'history' | 'settings';

export const NAV_ITEMS: { key: ViewKey; label: string; icon: typeof Home }[] = [
  { key: 'today', label: '今日', icon: Home },
  { key: 'tasks', label: '任务', icon: ClipboardList },
  { key: 'topics', label: '内容主题', icon: Lightbulb },
  { key: 'experiments', label: '实验', icon: FlaskConical },
  { key: 'history', label: '历史', icon: History },
  { key: 'settings', label: '设置', icon: Settings },
];

interface SidebarProps {
  view: ViewKey;
  onNavigate: (view: ViewKey) => void;
  settings: SettingsDoc;
}

export function Sidebar({ view, onNavigate, settings }: SidebarProps) {
  return (
    <nav className="sidebar" aria-label="主导航">
      <div className="brand">
        <Leaf size={22} aria-hidden="true" className="brand-leaf" />
        <div>
          <p className="brand-name">拾光创作园</p>
          <p className="brand-sub">让好内容生长</p>
        </div>
      </div>
      <ul className="nav-list">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <li key={key}>
            <button
              type="button"
              className={`nav-item${view === key ? ' is-active' : ''}`}
              aria-current={view === key ? 'page' : undefined}
              onClick={() => onNavigate(key)}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="sidebar-user">
        <div className="avatar" aria-hidden="true">{settings.displayName.slice(0, 1)}</div>
        <div>
          <p className="user-name">{settings.displayName}</p>
          <p className="user-motto">{settings.motto}</p>
        </div>
        <CalendarDays size={16} aria-hidden="true" className="user-tail" />
      </div>
    </nav>
  );
}
