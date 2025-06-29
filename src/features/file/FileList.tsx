import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import Fuse from 'fuse.js';
import { useAtom } from 'jotai';
import {
  selectedRepositoryAtom,
  filesAtom,
  searchQueryAtom,
  isLoadingAtom,
  errorAtom,
  selectedFileAtom,
  viewAtom,
} from '../store/atoms';
import { fetchRepositoryContents } from '../github/api';
import { downloadAndSaveFile } from '../download/download';
import type { FileItem } from '../github/api';

export const FileList: React.FC = () => {
  const [selectedRepository] = useAtom(selectedRepositoryAtom);
  const [files, setFiles] = useAtom(filesAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [isLoading, setLoading] = useAtom(isLoadingAtom);
  const [error, setError] = useAtom(errorAtom);
  const [selectedFile, selectFile] = useAtom(selectedFileAtom);
  const [, setView] = useAtom(viewAtom);

  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string>('');

  useInput(async (input, key) => {
    if (key.escape) {
      setView('repositories');
      setSearchQuery('');
      selectFile(null);
    }

    if (key.return && selectedFile && selectedFile.downloadUrl) {
      setIsDownloading(true);
      setDownloadStatus(`Downloading ${selectedFile.name}...`);

      try {
        await downloadAndSaveFile(selectedFile.downloadUrl, selectedFile.path);
        setDownloadStatus(`✅ Downloaded: ${selectedFile.path}`);
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
  });

  useEffect(() => {
    if (!selectedRepository) return;

    const loadFiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const [owner, repo] = selectedRepository.fullName.split('/');
        const items = await fetchRepositoryContents(owner, repo, currentPath);
        setFiles(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load files');
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [selectedRepository, currentPath, setFiles, setLoading, setError]);

  useEffect(() => {
    const fileItems = files.filter(item => item.type === 'file');

    if (searchQuery.trim() === '') {
      setFilteredFiles(fileItems);
    } else {
      const fuse = new Fuse(fileItems, {
        keys: ['name', 'path'],
        threshold: 0.3,
      });
      const results = fuse.search(searchQuery);
      setFilteredFiles(results.map(result => result.item));
    }
  }, [searchQuery, files]);

  const handleSelect = (item: { value: string }) => {
    const file = files.find(f => f.path === item.value);
    if (file) {
      if (file.type === 'dir') {
        setCurrentPath(file.path);
        setSearchQuery('');
      } else {
        selectFile(file);
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

  const dirItems = files
    .filter(item => item.type === 'dir')
    .map(dir => ({
      label: `📁 ${dir.name}`,
      value: dir.path,
    }));

  const fileItems = filteredFiles.map(file => ({
    label: `📄 ${file.name}`,
    value: file.path,
  }));

  const allItems = [...dirItems, ...fileItems];

  // 画面の高さを考慮して表示数を制限
  const MAX_VISIBLE_ITEMS = 10;
  const limitedItems = allItems.slice(0, MAX_VISIBLE_ITEMS);
  const hasMore = allItems.length > MAX_VISIBLE_ITEMS;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>{selectedRepository.fullName}</Text>
        {currentPath && <Text dimColor> / {currentPath}</Text>}
      </Box>
      <Box marginBottom={1}>
        <Text>Search files: </Text>
        <TextInput value={searchQuery} onChange={setSearchQuery} />
      </Box>
      {currentPath && (
        <Box marginBottom={1}>
          <Text dimColor>Press Esc to go back</Text>
        </Box>
      )}
      {limitedItems.length > 0 ? (
        <>
          <SelectInput items={limitedItems} onSelect={handleSelect} />
          {hasMore && searchQuery.trim() === '' && (
            <Box marginTop={1}>
              <Text dimColor>
                ... and {allItems.length - MAX_VISIBLE_ITEMS} more items. Type to search files.
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
