import { promises as fs } from 'fs';
import path from 'path';

export type FileEntry = {
  name: string;
  path: string;
  isDirectory: boolean;
};

export const loadLocalFiles = async (dir: string): Promise<FileEntry[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const fileEntries: FileEntry[] = entries
    .map(e => ({
      name: e.name,
      path: path.join(dir, e.name),
      isDirectory: e.isDirectory(),
    }))
    .sort((a, b) => {
      // ディレクトリを先に表示
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

  // 親ディレクトリへの移動オプション（ルート以外）
  if (dir !== '/') {
    fileEntries.unshift({
      name: '..',
      path: path.dirname(dir),
      isDirectory: true,
    });
  }

  return fileEntries;
};
