import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import Fuse from 'fuse.js';
import { useAtom } from 'jotai';
import {
  usernameAtom,
  repositoriesAtom,
  searchQueryAtom,
  isLoadingAtom,
  errorAtom,
  selectedRepositoryAtom,
  viewAtom,
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

  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);

  useEffect(() => {
    const loadRepositories = async () => {
      setLoading(true);
      setError(null);
      try {
        const repos = await fetchUserRepositories(username);
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
  }, [username, setRepositories, setLoading, setError]);

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

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Repositories for {username}</Text>
      </Box>
      <Box marginBottom={1}>
        <Text>Search: </Text>
        <TextInput value={searchQuery} onChange={setSearchQuery} />
      </Box>
      {items.length > 0 ? (
        <SelectInput items={items} onSelect={handleSelect} />
      ) : (
        <Text dimColor>No repositories found</Text>
      )}
    </Box>
  );
};
