import { promises as fs } from 'fs';
import path from 'path';
import { downloadFile } from '../github/api';
import { addToHistory } from '../history/storage';

export const saveFile = async (
  filePath: string,
  content: string,
): Promise<void> => {
  const fullPath = path.join(process.cwd(), filePath);
  const dir = path.dirname(fullPath);

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(fullPath, content, 'utf-8');
};

export const downloadAndSaveFile = async (
  downloadUrl: string,
  filePath: string,
  repositoryName: string,
): Promise<void> => {
  const content = await downloadFile(downloadUrl);
  await saveFile(filePath, content);

  // 履歴に追加
  await addToHistory({
    filePath,
    repositoryName,
    downloadUrl,
  });
};
