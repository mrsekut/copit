import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import path from 'path';
import { SelectList } from '../../components/SelectList.js';
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
    if (!file || file.isDirectory) return;

    const relativePath = computeRelativePath(projectRoot, file.path);
    setRegisterState({ type: 'confirming', file, relativePath });
  };

  const handleGoToParent = () => {
    if (currentDir !== '/') {
      setCurrentDir(path.dirname(currentDir));
    }
  };

  const handleEnterDirectory = (item: { value: string }) => {
    const file = files.find(f => f.path === item.value);
    if (file?.isDirectory) {
      setCurrentDir(file.path);
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
          onLeft={handleGoToParent}
          onRight={handleEnterDirectory}
        />
      );
  }
};

// fuzzy match: パターンの文字が順番にテキストに含まれているか判定
const fuzzyMatch = (pattern: string, text: string): boolean => {
  const lowerPattern = pattern.toLowerCase();
  const lowerText = text.toLowerCase();
  let patternIndex = 0;
  for (let i = 0; i < lowerText.length && patternIndex < lowerPattern.length; i++) {
    if (lowerText[i] === lowerPattern[patternIndex]) {
      patternIndex++;
    }
  }
  return patternIndex === lowerPattern.length;
};

// ファイルブラウザ
type FileBrowserProps = {
  files: FileEntry[];
  currentDir: string;
  projectRoot: string;
  onSelect: (item: { value: string }) => void;
  onLeft: () => void;
  onRight: (item: { value: string }) => void;
};

const FileBrowser: React.FC<FileBrowserProps> = ({
  files,
  currentDir,
  projectRoot,
  onSelect,
  onLeft,
  onRight,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // ディレクトリ変更時に検索クエリをリセット
  useEffect(() => {
    setSearchQuery('');
  }, [currentDir]);

  // 検索入力のハンドリング
  useInput((input, key) => {
    // Escで検索クリア
    if (key.escape) {
      setSearchQuery('');
      return;
    }

    // バックスペース
    if (key.backspace || key.delete) {
      setSearchQuery(prev => prev.slice(0, -1));
      return;
    }

    // 通常の文字入力（制御キー以外）
    if (input && !key.ctrl && !key.meta && !key.return && !key.upArrow && !key.downArrow && !key.leftArrow && !key.rightArrow && !key.tab) {
      setSearchQuery(prev => prev + input);
    }
  });

  // .. エントリを除外（← で親に移動するため）
  const baseFiles = files.filter(f => f.name !== '..');

  // 検索クエリでフィルタリング
  const filteredFiles = searchQuery
    ? baseFiles.filter(f => fuzzyMatch(searchQuery, f.name))
    : baseFiles;

  const items = filteredFiles.map(f => ({
    label: f.isDirectory ? `📁 ${f.name}` : `📄 ${f.name}`,
    value: f.path,
  }));

  const relativeCurrentDir =
    currentDir === projectRoot
      ? '.'
      : computeRelativePath(projectRoot, currentDir);

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          📌 Register Template
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text dimColor>Current: {relativeCurrentDir}</Text>
      </Box>

      {/* 検索バー */}
      <Box marginBottom={1}>
        <Text color="yellow">🔍 </Text>
        <Text>{searchQuery}</Text>
        <Text color="gray">▌</Text>
      </Box>

      <SelectList
        items={items}
        onSelect={onSelect}
        onLeft={onLeft}
        onRight={onRight}
        limit={15}
      />
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
