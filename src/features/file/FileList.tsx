import React, { useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { useAtom, useSetAtom } from 'jotai';
import { searchQueryAtom, viewAtom } from '../store/atoms';
import { useAuthToken } from '../auth/useAuthToken';
import { useSelectedRepository } from '../repository/useSelectedRepository';
import { useFiles } from './useFiles';

export const FileList: React.FC = () => {
  const selectedRepository = useSelectedRepository();
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const setView = useSetAtom(viewAtom);
  const { token: authToken } = useAuthToken();
  const {
    files,
    filteredFiles,
    isLoading,
    error,
    isDownloading,
    downloadStatus,
    loadFiles,
    selectFile,
    filterFiles,
    downloadFile,
  } = useFiles();

  useInput(async (input, key) => {
    if (key.escape) {
      setView('repositories');
      setSearchQuery('');
      selectFile(null);
    }
  });

  useEffect(() => {
    if (selectedRepository) {
      loadFiles(selectedRepository, authToken);
    }
  }, [selectedRepository, authToken]);

  useEffect(() => {
    filterFiles(searchQuery);
  }, [searchQuery]);

  const handleSelect = async (item: { value: string }) => {
    const file = files.find(f => f.path === item.value);
    if (file && selectedRepository) {
      await downloadFile(file, selectedRepository);
    }
  };

  if (!selectedRepository) {
    return null;
  }

  if (isLoading) {
    return (
      <Box flexDirection="column">
        <Text>Loading files...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  const items = filteredFiles.map(file => ({
    label: `📄 ${file.path}`,
    value: file.path,
  }));

  // 画面の高さを考慮して表示数を制限
  const MAX_VISIBLE_ITEMS = 10;
  const limitedItems = items.slice(0, MAX_VISIBLE_ITEMS);
  const hasMore = items.length > MAX_VISIBLE_ITEMS;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>{selectedRepository.fullName}</Text>
      </Box>
      <Box marginBottom={1}>
        <Text>Search files: </Text>
        <TextInput value={searchQuery} onChange={setSearchQuery} />
      </Box>
      {limitedItems.length > 0 ? (
        <>
          <SelectInput items={limitedItems} onSelect={handleSelect} />
          {hasMore && searchQuery.trim() === '' && (
            <Box marginTop={1}>
              <Text dimColor>
                ... and {items.length - MAX_VISIBLE_ITEMS} more files. Type to
                search.
              </Text>
            </Box>
          )}
        </>
      ) : (
        <Text dimColor>No files found</Text>
      )}
      {downloadStatus && (
        <Box marginTop={1}>
          <Text>{downloadStatus}</Text>
        </Box>
      )}
      {isDownloading && (
        <Box marginTop={1}>
          <Text color="yellow">Downloading...</Text>
        </Box>
      )}
    </Box>
  );
};
