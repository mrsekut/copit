import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import Fuse from 'fuse.js';
import { useAppStore } from '../store/app';
import { fetchRepositoryContents } from '../github/api';
import { downloadAndSaveFile } from '../download/download';
import type { FileItem } from '../github/api';

export const FileList: React.FC = () => {
  const {
    selectedRepository,
    files,
    searchQuery,
    isLoading,
    error,
    selectedFile,
    setFiles,
    setSearchQuery,
    selectFile,
    setView,
    setLoading,
    setError,
  } = useAppStore();

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
        setDownloadStatus(`❌ Failed to download: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
    const fileItems = files.filter((item) => item.type === 'file');
    
    if (searchQuery.trim() === '') {
      setFilteredFiles(fileItems);
    } else {
      const fuse = new Fuse(fileItems, {
        keys: ['name', 'path'],
        threshold: 0.3,
      });
      const results = fuse.search(searchQuery);
      setFilteredFiles(results.map((result) => result.item));
    }
  }, [searchQuery, files]);

  const handleSelect = (item: { value: string }) => {
    const file = files.find((f) => f.path === item.value);
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
    .filter((item) => item.type === 'dir')
    .map((dir) => ({
      label: `📁 ${dir.name}`,
      value: dir.path,
    }));

  const fileItems = filteredFiles.map((file) => ({
    label: `📄 ${file.name}`,
    value: file.path,
  }));

  const allItems = [...dirItems, ...fileItems];

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
      {allItems.length > 0 ? (
        <SelectInput items={allItems} onSelect={handleSelect} />
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