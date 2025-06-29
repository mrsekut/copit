import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import Fuse from 'fuse.js';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  selectedRepositoryAtom,
  filesAtom,
  searchQueryAtom,
  isLoadingAtom,
  errorAtom,
  selectedFileAtom,
  viewAtom,
  authTokenAtom,
} from '../store/atoms';
import { fetchAllRepositoryFiles } from '../github/api';
import { downloadAndSaveFile } from '../download/download';
import type { FileItem } from '../github/api';

export const FileList: React.FC = () => {
  const selectedRepository = useAtomValue(selectedRepositoryAtom);
  const [files, setFiles] = useAtom(filesAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [isLoading, setLoading] = useAtom(isLoadingAtom);
  const [error, setError] = useAtom(errorAtom);
  const selectFile = useSetAtom(selectedFileAtom);
  const setView = useSetAtom(viewAtom);
  const authToken = useAtomValue(authTokenAtom);

  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string>('');

  useInput(async (input, key) => {
    if (key.escape) {
      setView('repositories');
      setSearchQuery('');
      selectFile(null);
    }
  });

  useEffect(() => {
    if (!selectedRepository) return;

    const loadFiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const [owner, repo] = selectedRepository.fullName.split('/');
        const items = await fetchAllRepositoryFiles(owner, repo, authToken);
        setFiles(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load files');
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [selectedRepository, authToken, setFiles, setLoading, setError]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFiles(files);
    } else {
      const fuse = new Fuse(files, {
        keys: ['name', 'path'],
        threshold: 0.3,
      });
      const results = fuse.search(searchQuery);
      setFilteredFiles(results.map(result => result.item));
    }
  }, [searchQuery, files]);

  const handleSelect = async (item: { value: string }) => {
    const file = files.find(f => f.path === item.value);
    if (file && file.downloadUrl) {
      selectFile(file);
      setIsDownloading(true);
      setDownloadStatus(`Downloading ${file.name}...`);

      try {
        await downloadAndSaveFile(
          file.downloadUrl,
          file.path,
          selectedRepository?.fullName || 'unknown',
        );
        setDownloadStatus(`✅ Downloaded: ${file.path}`);
        setTimeout(() => {
          setDownloadStatus('');
          selectFile(null);
        }, 2000);
      } catch (err) {
        setDownloadStatus(
          `❌ Failed to download: ${err instanceof Error ? err.message : 'Unknown error'}`,
        );
      } finally {
        setIsDownloading(false);
      }
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
