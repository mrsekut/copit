import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.github-file-fetcher');
const TOKEN_FILE = path.join(CONFIG_DIR, 'config.json');

export type AuthConfig = {
  token: string;
  username: string;
  expiresAt?: string;
};

export const ensureConfigDir = async (): Promise<void> => {
  try {
    await fs.access(CONFIG_DIR);
  } catch {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  }
};

export const saveAuthConfig = async (config: AuthConfig): Promise<void> => {
  await ensureConfigDir();
  await fs.writeFile(TOKEN_FILE, JSON.stringify(config, null, 2), 'utf-8');
};

export const loadAuthConfig = async (): Promise<AuthConfig | null> => {
  try {
    const data = await fs.readFile(TOKEN_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const deleteAuthConfig = async (): Promise<void> => {
  try {
    await fs.unlink(TOKEN_FILE);
  } catch {
    // ファイルが存在しない場合は無視
  }
};