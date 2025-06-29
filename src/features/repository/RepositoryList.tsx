import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import Fuse from 'fuse.js';
import { useAtom } from 'jotai';
import { useInput } from 'ink';
import {
  usernameAtom,
  repositoriesAtom,
  searchQueryAtom,
  isLoadingAtom,
  errorAtom,
  selectedRepositoryAtom,
  viewAtom,
  authTokenAtom,
} from '../store/atoms';
import { fetchUserRepositories } from '../github/api';
import type { Repository } from '../github/api';

export const RepositoryList: React.FC = () => {
  const [username] = useAtom(usernameAtom);
  const [repositories, setRepositories] = useAtom(repositoriesAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [isLoading, setLoading] = useAtom(isLoadingAtom);
  const [error, setError] = useAtom(errorAtom);
  const [, selectRepository] = useAtom(selectedRepositoryAtom);
  const [, setView] = useAtom(viewAtom);
  const [authToken] = useAtom(authTokenAtom);

  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);

  useInput((input, key) => {
    if (key.tab) {
      setView('history');
      setSearchQuery('');
    }
  });

  useEffect(() => {
    const loadRepositories = async () => {
      if (!authToken) return;
      
      setLoading(true);
      setError(null);
      try {
        const repos = await fetchUserRepositories(authToken);
        setRepositories(repos);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load repositories',
        );
      } finally {
        setLoading(false);
      }
    };

    loadRepositories();
  }, [username, authToken, setRepositories, setLoading, setError]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRepos(repositories);
    } else {
      const fuse = new Fuse(repositories, {
        keys: ['name', 'description'],
        threshold: 0.3,
      });
      const results = fuse.search(searchQuery);
      setFilteredRepos(results.map(result => result.item));
    }
  }, [searchQuery, repositories]);

  const handleSelect = (item: { value: string }) => {
    const repo = repositories.find(r => r.fullName === item.value);
    if (repo) {
      selectRepository(repo);
      setSearchQuery(''); // 検索フィールドをクリア
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
          <Text bold color="cyan">📁 Browse Files</Text>
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
                ... and {items.length - MAX_VISIBLE_ITEMS} more repositories. Type to search.
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
