import { Octokit } from '@octokit/rest';

const octokit = new Octokit();

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
  const { data } = await octokit.repos.listForUser({
    username,
    per_page: 100,
    sort: 'updated',
  });

  return data.map((repo) => ({
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

  return data.map((item) => ({
    name: item.name,
    path: item.path,
    type: item.type as 'file' | 'dir',
    size: item.size,
    downloadUrl: item.download_url,
  }));
};

export const downloadFile = async (downloadUrl: string): Promise<string> => {
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  return response.text();
};