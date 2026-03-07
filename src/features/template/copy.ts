import { promises as fs } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { getTemplateFilePath, type Template } from './storage.js';

export const computeRelativePath = (cwd: string, filePath: string): string => {
  return path.relative(cwd, filePath);
};

export const checkFileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

export const copyTemplateToDir = async (
  template: Template,
  destDir: string,
): Promise<string> => {
  const sourcePath = getTemplateFilePath(template);
  const destPath = path.join(destDir, template.relativePath);

  // 中間ディレクトリを作成
  await fs.mkdir(path.dirname(destPath), { recursive: true });

  // ファイルをコピー
  await fs.copyFile(sourcePath, destPath);

  return destPath;
};

export const getDestPath = (destDir: string, relativePath: string): string => {
  return path.join(destDir, relativePath);
};

export const copyTemplateToClipboard = async (
  template: Template,
): Promise<void> => {
  const sourcePath = getTemplateFilePath(template);
  const content = await fs.readFile(sourcePath, 'utf-8');

  return new Promise((resolve, reject) => {
    const proc = spawn('pbcopy');
    proc.stdin.write(content);
    proc.stdin.end();
    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`pbcopy exited with code ${code}`));
    });
  });
};
