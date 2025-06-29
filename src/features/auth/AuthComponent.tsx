import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { spawn } from 'child_process';
import { startDeviceFlow } from './device-flow';

type AuthComponentProps = {
  onAuthComplete: (token: string, username: string) => void;
  onAuthError: (error: string) => void;
};

export const AuthComponent: React.FC<AuthComponentProps> = ({
  onAuthComplete,
  onAuthError,
}) => {
  const [status, setStatus] = useState<string>('Initializing authentication...');
  const [userCode, setUserCode] = useState<string>('');
  const [verificationUri, setVerificationUri] = useState<string>('');

  const openBrowser = (url: string) => {
    const platform = process.platform;
    let command: string;

    switch (platform) {
      case 'darwin':
        command = 'open';
        break;
      case 'win32':
        command = 'start';
        break;
      default:
        command = 'xdg-open';
    }

    spawn(command, [url], { detached: true, stdio: 'ignore' });
  };

  useEffect(() => {
    const authenticate = async () => {
      try {
        const result = await startDeviceFlow(
          (data) => {
            setUserCode(data.user_code);
            setVerificationUri(data.verification_uri);
            setStatus('Opening browser for authentication...');
            
            // ブラウザを自動で開く
            openBrowser(data.verification_uri);
            
            setStatus('Please complete authentication in your browser');
          },
          (message) => {
            setStatus(message);
          },
        );

        // 認証完了時に親コンポーネントに通知
        setStatus('Authentication successful!');
        onAuthComplete(result.token, result.username);
      } catch (error) {
        onAuthError(error instanceof Error ? error.message : 'Authentication failed');
      }
    };

    authenticate();
  }, [onAuthComplete, onAuthError]);

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          GitHub Authentication Required
        </Text>
      </Box>
      <Box marginBottom={1}>
        <Text>{status}</Text>
      </Box>
      {userCode && (
        <Box flexDirection="column" marginBottom={1}>
          <Text>Device Code: <Text bold color="yellow">{userCode}</Text></Text>
          <Text>Please visit: <Text bold color="blue">{verificationUri}</Text></Text>
        </Box>
      )}
      <Box marginBottom={1}>
        <Text dimColor>
          This is a one-time setup. Your credentials will be saved securely.
        </Text>
      </Box>
    </Box>
  );
};