import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { useSetAtom } from 'jotai';
import { viewAtom } from '../store/atoms.js';
import { loadLocalFiles, type FileEntry } from './file-browser.js';
import { registerTemplate } from './storage.js';
import { computeRelativePath } from './copy.js';

type RegisterState =
  | { type: 'browsing' }
  | { type: 'naming'; file: FileEntry; relativePath: string }
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
  const [templateName, setTemplateName] = useState('');

  useInput((_input, key) => {
    if (key.escape && registerState.type === 'naming') {
      setRegisterState({ type: 'browsing' });
      setTemplateName('');
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
      setRegisterState({ type: 'naming', file, relativePath });
      setTemplateName(file.name);
    }
  };

  const handleRegister = async () => {
    if (registerState.type !== 'naming' || !templateName.trim()) return;

    setRegisterState({ type: 'registering' });

    try {
      await registerTemplate(
        registerState.file.path,
        registerState.relativePath,
        templateName.trim(),
      );
      setRegisterState({
        type: 'done',
        message: `✅ Registered: ${templateName}`,
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
    case 'naming':
      return (
        <NamingForm
          relativePath={registerState.relativePath}
          templateName={templateName}
          onChangeName={setTemplateName}
          onSubmit={handleRegister}
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

  const displayItems = items.slice(0, 15);
  const hasMore = items.length > 15;

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

      <SelectInput items={displayItems} onSelect={onSelect} />

      {hasMore && (
        <Box marginTop={1}>
          <Text dimColor>... and {items.length - 15} more files</Text>
        </Box>
      )}
    </Box>
  );
};

// 名前入力フォーム
type NamingFormProps = {
  relativePath: string;
  templateName: string;
  onChangeName: (name: string) => void;
  onSubmit: () => void;
};

const NamingForm: React.FC<NamingFormProps> = ({
  relativePath,
  templateName,
  onChangeName,
  onSubmit,
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

      <Box marginBottom={1}>
        <Text>Template name: </Text>
        <TextInput
          value={templateName}
          onChange={onChangeName}
          onSubmit={onSubmit}
        />
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
