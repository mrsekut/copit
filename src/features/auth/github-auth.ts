import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device';
import { Octokit } from '@octokit/rest';
import { saveAuth, loadAuth, clearAuth, type AuthData } from './storage';

const CLIENT_ID = 'Ov23liff7NX2LqQy2sW6';

export type AuthResult = {
  token: string;
  username: string;
};

export type VerificationData = {
  userCode: string;
  verificationUri: string;
};

export const authenticateWithGitHub = async (
  onVerification: (data: VerificationData) => void,
): Promise<AuthResult> => {
  const auth = createOAuthDeviceAuth({
    clientType: 'oauth-app',
    clientId: CLIENT_ID,
    onVerification: data => {
      onVerification({
        userCode: data.user_code,
        verificationUri: data.verification_uri,
      });
    },
  });

  const { token } = await auth({ type: 'oauth' });

  // ユーザー情報を取得
  const octokit = new Octokit({ auth: token });
  const { data: user } = await octokit.users.getAuthenticated();

  const authData: AuthData = {
    token,
    username: user.login,
  };

  await saveAuth(authData);

  return {
    token,
    username: user.login,
  };
};

export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const octokit = new Octokit({ auth: token });
    await octokit.users.getAuthenticated();
    return true;
  } catch {
    return false;
  }
};

export const getStoredAuth = async (): Promise<AuthResult | null> => {
  const authData = await loadAuth();
  if (!authData) return null;

  const isValid = await validateToken(authData.token);
  if (!isValid) {
    await clearAuth();
    return null;
  }

  return authData;
};
