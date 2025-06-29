import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { spawn } from 'child_process';
import { authenticateWithGitHub, type VerificationData } from './github-auth';

type Props = {
  onSuccess: (token: string, username: string) => void;
  onError: (error: string) => void;
};

export const AuthScreen: React.FC<Props> = ({ onSuccess, onError }) => {
  const [status, setStatus] = useState('Initializing authentication...');
  const [verificationData, setVerificationData] =
    useState<VerificationData | null>(null);

  const openBrowser = (url: string) => {
    const platform = process.platform;
    const command =
      platform === 'darwin'
        ? 'open'
        : platform === 'win32'
          ? 'start'
          : 'xdg-open';
    spawn(command, [url], { detached: true, stdio: 'ignore' });
  };

  useEffect(() => {
    const authenticate = async () => {
      try {
        setStatus('Starting authentication...');

        const result = await authenticateWithGitHub(data => {
          setVerificationData(data);
          setStatus('Opening browser...');
          openBrowser(data.verificationUri);
          setStatus('Complete authentication in your browser');
        });

        setStatus('Authentication successful!');
        onSuccess(result.token, result.username);
      } catch (error) {
        onError(
          error instanceof Error ? error.message : 'Authentication failed',
        );
      }
    };

    authenticate();
  }, [onSuccess, onError]);

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

      {verificationData && (
        <Box flexDirection="column" marginBottom={1}>
          <Text>
            Visit:{' '}
            <Text bold color="blue">
              {verificationData.verificationUri}
            </Text>
          </Text>
          <Text>
            Code:{' '}
            <Text bold color="yellow">
              {verificationData.userCode}
            </Text>
          </Text>
        </Box>
      )}

      <Box>
        <Text dimColor>
          This is a one-time setup. Credentials will be saved securely.
        </Text>
      </Box>
    </Box>
  );
};
