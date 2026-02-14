import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { SelectList } from './SelectList.js';
import { useSetAtom } from 'jotai';
import { viewAtom } from '../store/atoms.js';
import { loadLocalFiles, type FileEntry } from './file-browser.js';
import { registerTemplate } from './storage.js';
import { computeRelativePath } from './copy.js';
import { FilePreview } from './FilePreview.js';

type RegisterState =
  | { type: 'browsing' }
  | { type: 'confirming'; file: FileEntry; relativePath: string }
  | { type: 'registering' }
  | { type: 'done'; message: string };

export const RegisterScreen: React.FC = () => {
  const setView = useSetAtom(viewAtom);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [currentDir, setCurrentDir] = useState(process.cwd());
  const [projectRoot] = useState(process.cwd());
  const [isLoading, setIsLoading] = useState(true);
  const [registerState, setRegisterState] = useState<RegisterState>({
    type: 'browsing',
  });

  useInput((_input, key) => {
    if (registerState.type === 'confirming') {
      if (key.escape) {
        setRegisterState({ type: 'browsing' });
      }
      if (key.return) {
        handleRegister();
      }
      return;
    }
    if (key.tab && registerState.type === 'browsing') {
      setView('templates');
    }
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const entries = await loadLocalFiles(currentDir);
        setFiles(entries);
      } catch (error) {
        console.error('Failed to load files:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [currentDir]);

  const handleSelectFile = (item: { value: string }) => {
    const file = files.find(f => f.path === item.value);
    if (!file) return;

    if (file.isDirectory) {
      setCurrentDir(file.path);
    } else {
      const relativePath = computeRelativePath(projectRoot, file.path);
      setRegisterState({ type: 'confirming', file, relativePath });
    }
  };

  const handleRegister = async () => {
    if (registerState.type !== 'confirming') return;

    const { file, relativePath } = registerState;
    setRegisterState({ type: 'registering' });

    try {
      await registerTemplate(file.path, relativePath, relativePath);
      setRegisterState({
        type: 'done',
        message: `✅ Registered: ${relativePath}`,
      });
      setTimeout(() => {
        setRegisterState({ type: 'browsing' });
      }, 1000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setRegisterState({ type: 'done', message: `❌ Failed: ${message}` });
      setTimeout(() => {
        setRegisterState({ type: 'browsing' });
      }, 3000);
    }
  };

  if (isLoading) {
    return <Text>Loading files...</Text>;
  }

  switch (registerState.type) {
    case 'confirming':
      return (
        <ConfirmScreen
          file={registerState.file}
          relativePath={registerState.relativePath}
        />
      );
    case 'registering':
      return <RegisteringStatus />;
    case 'done':
      return <DoneStatus message={registerState.message} />;
    case 'browsing':
      return (
        <FileBrowser
          files={files}
          currentDir={currentDir}
          projectRoot={projectRoot}
          onSelect={handleSelectFile}
        />
      );
  }
};

// ファイルブラウザ
type FileBrowserProps = {
  files: FileEntry[];
  currentDir: string;
  projectRoot: string;
  onSelect: (item: { value: string }) => void;
};

const FileBrowser: React.FC<FileBrowserProps> = ({
  files,
  currentDir,
  projectRoot,
  onSelect,
}) => {
  const items = files.map(f => ({
    label: f.isDirectory ? `📁 ${f.name}` : `📄 ${f.name}`,
    value: f.path,
  }));

  return (
    <Box flexDirection="column">
      <Box marginBottom={1} flexDirection="row" justifyContent="space-between">
        <Text bold color="cyan">
          📌 Register Template
        </Text>
        <Text dimColor>Root: {projectRoot}</Text>
      </Box>

      <Box marginBottom={1}>
        <Text dimColor>Current: {currentDir}</Text>
      </Box>

      <SelectList items={items} onSelect={onSelect} limit={15} />
    </Box>
  );
};

// 確認画面
type ConfirmScreenProps = {
  file: FileEntry;
  relativePath: string;
};

const ConfirmScreen: React.FC<ConfirmScreenProps> = ({
  file,
  relativePath,
}) => {
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          📌 Register Template
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text>File: </Text>
        <Text color="green">{relativePath}</Text>
      </Box>

      <Box marginBottom={1} flexDirection="column">
        <Text dimColor>Preview:</Text>
        <Box marginTop={1}>
          <FilePreview filePath={file.path} lines={10} />
        </Box>
      </Box>

      <Text dimColor>[Enter] Register [Esc] Cancel</Text>
    </Box>
  );
};

// 登録中ステータス
const RegisteringStatus: React.FC = () => {
  return (
    <Box flexDirection="column">
      <Text color="yellow">Registering...</Text>
    </Box>
  );
};

// 完了ステータス
type DoneStatusProps = {
  message: string;
};

const DoneStatus: React.FC<DoneStatusProps> = ({ message }) => {
  return (
    <Box flexDirection="column">
      <Text>{message}</Text>
    </Box>
  );
};
