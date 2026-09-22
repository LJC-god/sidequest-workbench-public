import type { WorkbenchDoc } from './types';
import { dayKey, todayKey } from './date';

/** Demo data written only when the storage key is entirely absent. */
export function createSeedDoc(): WorkbenchDoc {
  const today = todayKey();
  const now = new Date();
  const yesterday = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));

  return {
    schemaVersion: 1,
    accounts: [
      { id: 'acc-en-main', name: '英语主账号', platform: '公众号', color: '#3e6b4f', active: true },
      { id: 'acc-de-ai', name: '德语与 AI 账号', platform: '小红书', color: '#7a6ca8', active: true },
      { id: 'acc-en-dist', name: '英语分发账号', platform: '即刻', color: '#4e7e8c', active: true },
    ],
    topics: [
      { id: 'topic-ielts', name: '雅思口语' },
      { id: 'topic-german', name: '德语入门' },
      { id: 'topic-ai-tools', name: 'AI 工具' },
      { id: 'topic-essay', name: '四六级爽文' },
    ],
    tasks: [
      {
        id: 'task-ielts-open', title: '雅思口语开头怎么背', note: '3 个万能模板 + 高频替换词',
        accountId: 'acc-en-main', topicId: 'topic-ielts', priority: 'high', status: 'draft',
        plannedDate: today, plannedTime: '10:30', createdAt: now.toISOString(), completedAt: null,
      },
      {
        id: 'task-german-a1', title: '德语高频词：A1 必备 100 词', note: '制作图文脚本',
        accountId: 'acc-de-ai', topicId: 'topic-german', priority: 'high', status: 'capture',
        plannedDate: today, plannedTime: '14:00', createdAt: now.toISOString(), completedAt: null,
      },
      {
        id: 'task-essay-queen', title: '四六级爽文：女主逆袭篇', note: '剪辑 + 字幕 + 封面',
        accountId: 'acc-en-dist', topicId: 'topic-essay', priority: 'medium', status: 'editing',
        plannedDate: today, plannedTime: '16:00', createdAt: now.toISOString(), completedAt: null,
      },
      {
        id: 'task-ai-tutorial', title: 'AI 工具使用教程', note: '录屏 + 讲解 + 案例演示',
        accountId: 'acc-de-ai', topicId: 'topic-ai-tools', priority: 'medium', status: 'review',
        plannedDate: today, plannedTime: '18:00', createdAt: now.toISOString(), completedAt: null,
      },
      {
        id: 'task-xhs-cover', title: '小红书商品图设计', note: '确定风格 + 生成初稿',
        accountId: 'acc-en-main', topicId: 'topic-ai-tools', priority: 'low', status: 'draft',
        plannedDate: today, plannedTime: '20:00', createdAt: now.toISOString(), completedAt: null,
      },
      {
        id: 'task-vocab-set', title: '雅思词汇：同义替换合集', note: '整理 Part 2 高频词',
        accountId: 'acc-en-main', topicId: 'topic-ielts', priority: 'medium', status: 'done',
        plannedDate: today, plannedTime: '09:00', createdAt: now.toISOString(), completedAt: now.toISOString(),
      },
      {
        id: 'task-german-words-1', title: '德语 A1 高频词（上）', note: '图文排版已确认',
        accountId: 'acc-de-ai', topicId: 'topic-german', priority: 'medium', status: 'done',
        plannedDate: today, plannedTime: '12:00', createdAt: now.toISOString(), completedAt: now.toISOString(),
      },
    ],
    experiments: [
      {
        id: 'exp-cover-style', title: '封面风格 A/B', hypothesis: '手写体封面点击率高于模板体',
        metric: '48 小时点击率', status: 'running', conclusion: '',
      },
      {
        id: 'exp-post-time', title: '发布时间实验', hypothesis: '工作日 21 点发布打开率更高',
        metric: '首小时打开率', status: 'idea', conclusion: '',
      },
    ],
    history: [
      {
        id: 'hist-site-check', title: '网站上线检查清单', accountId: 'acc-en-dist',
        completedOn: yesterday, outcome: 'completed',
      },
      {
        id: 'hist-ielts-part1', title: '雅思口语 Part 1 模板整理', accountId: 'acc-en-main',
        completedOn: yesterday, outcome: 'published',
      },
    ],
    settings: {
      displayName: '林小象',
      motto: '持续创作，让好内容生长',
      dailyGoal: 3,
      weeklyGoal: 12,
      weekStartsOn: 1,
      compact: false,
    },
    planConfirmedOn: null,
  };
}
