import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.github-file-fetcher');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export type AuthData = {
  token: string;
  username: string;
};

const ensureConfigDir = async (): Promise<void> => {
  try {
    await fs.access(CONFIG_DIR);
  } catch {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  }
};

export const saveAuth = async (authData: AuthData): Promise<void> => {
  await ensureConfigDir();
  await fs.writeFile(CONFIG_FILE, JSON.stringify(authData, null, 2), 'utf-8');
};

export const loadAuth = async (): Promise<AuthData | null> => {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const clearAuth = async (): Promise<void> => {
  try {
    await fs.unlink(CONFIG_FILE);
  } catch {
    // ファイルが存在しない場合は無視
  }
};