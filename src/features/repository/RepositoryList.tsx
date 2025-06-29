import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { useAtom, useSetAtom } from 'jotai';
import { useInput } from 'ink';
import {
  searchQueryAtom,
  viewAtom,
} from '../store/atoms';
import { useAuthToken } from '../auth/useAuthToken';
import { useRepositories } from './useRepositories';

export const RepositoryList: React.FC = () => {
  const { username, token: authToken } = useAuthToken();
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const setView = useSetAtom(viewAtom);
  const {
    repositories,
    filteredRepos,
    isLoading,
    error,
    loadRepositories,
    selectRepository,
    filterRepositories,
  } = useRepositories();

  useInput((input, key) => {
    if (key.tab) {
      setView('history');
      setSearchQuery('');
    }
  });

  useEffect(() => {
    loadRepositories(authToken);
  }, [username, authToken]);

  useEffect(() => {
    filterRepositories(searchQuery);
  }, [searchQuery]);

  const handleSelect = (item: { value: string }) => {
    const repo = repositories.find(r => r.fullName === item.value);
    if (repo) {
      selectRepository(repo);
      setSearchQuery('');
      setView('files');
    }
  };

  if (isLoading) {
    return (
      <Box flexDirection="column">
        <Text>Loading repositories...</Text>
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

  const items = filteredRepos.map(repo => ({
    label: `${repo.name}${repo.description ? ` - ${repo.description}` : ''}`,
    value: repo.fullName,
  }));

  // 画面の高さを考慮して表示数を制限
  const MAX_VISIBLE_ITEMS = 10;
  const limitedItems = items.slice(0, MAX_VISIBLE_ITEMS);
  const hasMore = items.length > MAX_VISIBLE_ITEMS;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1} flexDirection="row" justifyContent="space-between">
        <Box>
          <Text bold color="cyan">
            📁 Browse Files
          </Text>
        </Box>
        <Box>
          <Text dimColor>[Tab] </Text>
          <Text>📋 Download History</Text>
        </Box>
      </Box>
      <Box marginBottom={1}>
        <Text>Search: </Text>
        <TextInput value={searchQuery} onChange={setSearchQuery} />
      </Box>
      {limitedItems.length > 0 ? (
        <>
          <SelectInput items={limitedItems} onSelect={handleSelect} />
          {hasMore && searchQuery.trim() === '' && (
            <Box marginTop={1}>
              <Text dimColor>
                ... and {items.length - MAX_VISIBLE_ITEMS} more repositories.
                Type to search.
              </Text>
            </Box>
          )}
        </>
      ) : (
        <Text dimColor>No repositories found</Text>
      )}
    </Box>
  );
};
