import { Octokit } from '@octokit/rest';

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
  token: string,
): Promise<Repository[]> => {
  const octokit = new Octokit({
    auth: token,
    userAgent: 'github-file-fetcher',
  });

  const { data } = await octokit.repos.listForAuthenticatedUser({
    per_page: 100,
    sort: 'updated',
    visibility: 'all',
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
  path: string,
  token: string,
): Promise<FileItem[]> => {
  const octokit = new Octokit({
    auth: token,
    userAgent: 'github-file-fetcher',
  });

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
  token: string,
  path: string = '',
): Promise<FileItem[]> => {
  const items = await fetchRepositoryContents(owner, repo, path, token);
  const files: FileItem[] = [];

  for (const item of items) {
    if (item.type === 'file') {
      files.push(item);
    } else if (item.type === 'dir') {
      const subFiles = await fetchAllRepositoryFiles(
        owner,
        repo,
        token,
        item.path,
      );
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
