import { Octokit } from '@octokit/rest';

let octokit = new Octokit();

export const setOctokitAuth = (token: string): void => {
  octokit = new Octokit({
    auth: token,
    userAgent: 'github-file-fetcher',
  });
};

export type Repository = {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  description: string | null;
};

export type FileItem = {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  downloadUrl?: string | null;
};

export const fetchUserRepositories = async (
  username: string,
): Promise<Repository[]> => {
  // 認証されたユーザーの場合は listForAuthenticatedUser を使用
  const { data } = await octokit.repos.listForAuthenticatedUser({
    per_page: 100,
    sort: 'updated',
    visibility: 'all', // public + private リポジトリを取得
  });

  return data.map(repo => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    private: repo.private,
    description: repo.description,
  }));
};

export const fetchRepositoryContents = async (
  owner: string,
  repo: string,
  path: string = '',
): Promise<FileItem[]> => {
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path,
  });

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(item => ({
    name: item.name,
    path: item.path,
    type: item.type as 'file' | 'dir',
    size: item.size,
    downloadUrl: item.download_url,
  }));
};

export const fetchAllRepositoryFiles = async (
  owner: string,
  repo: string,
  path: string = '',
): Promise<FileItem[]> => {
  const items = await fetchRepositoryContents(owner, repo, path);
  const files: FileItem[] = [];
  
  for (const item of items) {
    if (item.type === 'file') {
      files.push(item);
    } else if (item.type === 'dir') {
      // 再帰的にディレクトリ内のファイルを取得
      const subFiles = await fetchAllRepositoryFiles(owner, repo, item.path);
      files.push(...subFiles);
    }
  }
  
  return files;
};

export const downloadFile = async (downloadUrl: string): Promise<string> => {
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  return response.text();
};
