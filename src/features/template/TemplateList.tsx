import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { useSetAtom } from 'jotai';
import { viewAtom } from '../store/atoms.js';
import { loadTemplates, deleteTemplate, type Template } from './storage.js';
import { copyTemplateToDir, checkFileExists, getDestPath } from './copy.js';

type ConfirmState =
  | { type: 'idle' }
  | { type: 'confirmingOverwrite'; template: Template; destPath: string }
  | { type: 'confirmingDelete'; template: Template }
  | { type: 'copying' }
  | { type: 'done'; message: string };

export const TemplateList: React.FC = () => {
  const setView = useSetAtom(viewAtom);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    type: 'idle',
  });
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useInput((input, key) => {
    if (confirmState.type === 'confirmingOverwrite') {
      if (input === 'y' || input === 'Y') {
        handleConfirmedCopy(confirmState.template);
      } else if (input === 'n' || input === 'N' || key.escape) {
        setConfirmState({ type: 'idle' });
      }
      return;
    }

    if (confirmState.type === 'confirmingDelete') {
      if (input === 'y' || input === 'Y') {
        handleConfirmedDelete(confirmState.template);
      } else if (input === 'n' || input === 'N' || key.escape) {
        setConfirmState({ type: 'idle' });
      }
      return;
    }

    if (key.tab) {
      setView('register');
    }

    if (input === 'd' && highlightedId) {
      const template = templates.find(t => t.id === highlightedId);
      if (template) {
        setConfirmState({ type: 'confirmingDelete', template });
      }
    }
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await loadTemplates();
      setTemplates(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleConfirmedCopy = async (template: Template) => {
    setConfirmState({ type: 'copying' });
    try {
      const destPath = await copyTemplateToDir(template, process.cwd());
      setConfirmState({ type: 'done', message: `✅ Copied to: ${destPath}` });
      setTimeout(() => setConfirmState({ type: 'idle' }), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setConfirmState({ type: 'done', message: `❌ Failed: ${message}` });
      setTimeout(() => setConfirmState({ type: 'idle' }), 3000);
    }
  };

  const handleConfirmedDelete = async (template: Template) => {
    try {
      await deleteTemplate(template.id);
      setTemplates(templates.filter(t => t.id !== template.id));
      setConfirmState({
        type: 'done',
        message: `🗑️ Deleted: ${template.name}`,
      });
      setTimeout(() => setConfirmState({ type: 'idle' }), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setConfirmState({ type: 'done', message: `❌ Failed: ${message}` });
      setTimeout(() => setConfirmState({ type: 'idle' }), 3000);
    }
  };

  const handleSelect = async (item: { value: string }) => {
    const template = templates.find(t => t.id === item.value);
    if (!template) return;

    const destPath = getDestPath(process.cwd(), template.relativePath);
    const exists = await checkFileExists(destPath);

    if (exists) {
      setConfirmState({ type: 'confirmingOverwrite', template, destPath });
    } else {
      await handleConfirmedCopy(template);
    }
  };

  const handleHighlight = (item: { value: string }) => {
    setHighlightedId(item.value);
  };

  if (isLoading) {
    return <Text>Loading templates...</Text>;
  }

  // 上書き確認ダイアログ
  if (confirmState.type === 'confirmingOverwrite') {
    return (
      <Box flexDirection="column">
        <Text bold color="yellow">
          ⚠️ File already exists
        </Text>
        <Box marginTop={1}>
          <Text>Overwrite {confirmState.destPath}?</Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>[y] Yes [n] No</Text>
        </Box>
      </Box>
    );
  }

  // 削除確認ダイアログ
  if (confirmState.type === 'confirmingDelete') {
    return (
      <Box flexDirection="column">
        <Text bold color="red">
          🗑️ Delete template
        </Text>
        <Box marginTop={1}>
          <Text>
            Delete &quot;{confirmState.template.name}&quot; (
            {confirmState.template.relativePath})?
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>[y] Yes [n] No</Text>
        </Box>
      </Box>
    );
  }

  const items = templates.map(t => ({
    label: `📄 ${t.name} (${t.relativePath})`,
    value: t.id,
  }));

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          📋 Templates
        </Text>
      </Box>

      {items.length > 0 ? (
        <SelectInput
          items={items}
          onSelect={handleSelect}
          onHighlight={handleHighlight}
        />
      ) : (
        <Box flexDirection="column">
          <Text dimColor>No templates registered</Text>
          <Text dimColor>Press [Tab] to register a template!</Text>
        </Box>
      )}

      {confirmState.type === 'done' && (
        <Box marginTop={1}>
          <Text>{confirmState.message}</Text>
        </Box>
      )}

      {confirmState.type === 'copying' && (
        <Box marginTop={1}>
          <Text color="yellow">Copying...</Text>
        </Box>
      )}
    </Box>
  );
};
