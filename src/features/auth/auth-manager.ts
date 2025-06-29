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
  console.log('Loaded auth config:', config ? 'CONFIG_EXISTS' : 'NO_CONFIG');
  
  if (!config) {
    return null;
  }

  console.log('Validating token...');
  const isValid = await validateToken(config.token);
  console.log('Token validation result:', isValid);
  
  if (!isValid) {
    console.log('Token invalid, deleting config');
    // 無効なトークンは削除
    await deleteAuthConfig();
    return null;
  }

  console.log('Token valid, returning config');
  return config;
};

export const createAuthenticatedOctokit = (token: string): Octokit => {
  return new Octokit({
    auth: token,
    userAgent: 'github-file-fetcher',
  });
};