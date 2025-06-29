import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.github-file-fetcher');
const HISTORY_FILE = path.join(CONFIG_DIR, 'history.json');
const MAX_HISTORY_ITEMS = 20;

export type HistoryItem = {
  id: string;
  filePath: string;
  repositoryName: string;
  downloadedAt: string;
  downloadUrl: string;
};

const ensureConfigDir = async (): Promise<void> => {
  try {
    await fs.access(CONFIG_DIR);
  } catch {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  }
};

export const addToHistory = async (item: Omit<HistoryItem, 'id' | 'downloadedAt'>): Promise<void> => {
  await ensureConfigDir();
  
  const history = await loadHistory();
  
  // 同じファイルが既に履歴にある場合は削除（重複を避ける）
  const filteredHistory = history.filter(
    h => h.filePath !== item.filePath || h.repositoryName !== item.repositoryName
  );
  
  // 新しいアイテムを先頭に追加
  const newItem: HistoryItem = {
    ...item,
    id: generateId(),
    downloadedAt: new Date().toISOString(),
  };
  
  const updatedHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
  
  await fs.writeFile(HISTORY_FILE, JSON.stringify(updatedHistory, null, 2), 'utf-8');
};

export const loadHistory = async (): Promise<HistoryItem[]> => {
  try {
    const data = await fs.readFile(HISTORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const clearHistory = async (): Promise<void> => {
  try {
    await fs.unlink(HISTORY_FILE);
  } catch {
    // ファイルが存在しない場合は無視
  }
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};