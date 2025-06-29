import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import Fuse from 'fuse.js';
import { repositoriesAtom, selectedRepositoryAtom } from './atoms.js';
import { fetchUserRepositories } from '../github/api.js';
import type { Repository } from '../github/api.js';

export const useRepositories = () => {
  const [repositories, setRepositories] = useAtom(repositoriesAtom);
  const [selectedRepository, setSelectedRepository] = useAtom(
    selectedRepositoryAtom,
  );
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRepositories = async (authToken: string) => {
    if (!authToken) return;

    setLoading(true);
    setError(null);
    try {
      const repos = await fetchUserRepositories(authToken);
      setRepositories(repos);
      setFilteredRepos(repos);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load repositories',
      );
    } finally {
      setLoading(false);
    }
  };

  const selectRepository = (repo: Repository | null) => {
    setSelectedRepository(repo);
  };

  const filterRepositories = (query: string) => {
    if (query.trim() === '') {
      setFilteredRepos(repositories);
    } else {
      const fuse = new Fuse(repositories, {
        keys: ['name', 'description'],
        threshold: 0.3,
      });
      const results = fuse.search(query);
      setFilteredRepos(results.map(result => result.item));
    }
  };

  useEffect(() => {
    setFilteredRepos(repositories);
  }, [repositories]);

  return {
    repositories,
    selectedRepository,
    filteredRepos,
    isLoading,
    error,
    loadRepositories,
    selectRepository,
    filterRepositories,
  };
};
