import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.copit');
const TEMPLATES_DIR = path.join(CONFIG_DIR, 'templates');
const TEMPLATES_FILE = path.join(CONFIG_DIR, 'templates.json');

export type Template = {
  id: string;
  name: string;
  relativePath: string;
  registeredAt: string;
  registeredFrom?: string; // 登録元リポジトリのパス
};

const ensureConfigDir = async (): Promise<void> => {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.mkdir(TEMPLATES_DIR, { recursive: true });
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const loadTemplates = async (): Promise<Template[]> => {
  try {
    const data = await fs.readFile(TEMPLATES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveTemplates = async (templates: Template[]): Promise<void> => {
  await ensureConfigDir();
  await fs.writeFile(
    TEMPLATES_FILE,
    JSON.stringify(templates, null, 2),
    'utf-8',
  );
};

export const registerTemplate = async (
  sourceFilePath: string,
  relativePath: string,
  name: string,
): Promise<Template> => {
  await ensureConfigDir();

  const id = generateId();
  const templateDir = path.join(TEMPLATES_DIR, id);
  const destPath = path.join(templateDir, relativePath);

  // ディレクトリ構造を作成してファイルをコピー
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.copyFile(sourceFilePath, destPath);

  const template: Template = {
    id,
    name,
    relativePath,
    registeredAt: new Date().toISOString(),
    registeredFrom: process.cwd(),
  };

  const templates = await loadTemplates();
  await saveTemplates([template, ...templates]);

  return template;
};

export const deleteTemplate = async (id: string): Promise<void> => {
  // テンプレートディレクトリを削除
  const templateDir = path.join(TEMPLATES_DIR, id);
  try {
    await fs.rm(templateDir, { recursive: true });
  } catch {
    // ディレクトリが存在しない場合は無視
  }

  // メタデータから削除
  const templates = await loadTemplates();
  const filtered = templates.filter(t => t.id !== id);
  await saveTemplates(filtered);
};

export const getTemplateFilePath = (template: Template): string => {
  return path.join(TEMPLATES_DIR, template.id, template.relativePath);
};
