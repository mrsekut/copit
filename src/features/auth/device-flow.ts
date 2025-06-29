import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device';
import { GITHUB_OAUTH_CONFIG } from './config';
import { saveAuthConfig, type AuthConfig } from './token';

export type DeviceFlowResult = {
  token: string;
  username: string;
};

export const startDeviceFlow = async (
  onVerification: (data: { device_code: string; user_code: string; verification_uri: string }) => void,
  onProgress: (message: string) => void,
): Promise<DeviceFlowResult> => {
  const auth = createOAuthDeviceAuth({
    clientType: 'oauth-app',
    clientId: GITHUB_OAUTH_CONFIG.clientId,
    onVerification,
  });

  onProgress('Requesting device authorization...');

  const { token } = await auth({
    type: 'oauth',
  });

  // トークンを使ってユーザー情報を取得
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${token}`,
      'User-Agent': 'github-file-fetcher',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user information');
  }

  const user = await response.json() as { login: string };
  const username = user.login;

  // 認証情報を保存
  const authConfig: AuthConfig = {
    token,
    username,
  };

  await saveAuthConfig(authConfig);

  return {
    token,
    username,
  };
};