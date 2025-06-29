import { Octokit } from '@octokit/rest';
import { loadAuthConfig, deleteAuthConfig, type AuthConfig } from './token';

export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const octokit = new Octokit({ auth: token });
    await octokit.users.getAuthenticated();
    return true;
  } catch {
    return false;
  }
};

export const getValidAuthConfig = async (): Promise<AuthConfig | null> => {
  const config = await loadAuthConfig();
  
  if (!config) {
    return null;
  }

  const isValid = await validateToken(config.token);
  
  if (!isValid) {
    // 無効なトークンは削除
    await deleteAuthConfig();
    return null;
  }

  return config;
};

export const createAuthenticatedOctokit = (token: string): Octokit => {
  return new Octokit({
    auth: token,
    userAgent: 'github-file-fetcher',
  });
};