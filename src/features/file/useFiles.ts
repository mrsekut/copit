import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import Fuse from 'fuse.js';
import { filesAtom, selectedFileAtom } from './atoms.js';
import { fetchAllRepositoryFiles } from '../github/api.js';
import { downloadAndSaveFile } from '../download/download.js';
import type { FileItem } from '../github/api.js';
import type { Repository } from '../github/api.js';

export const useFiles = () => {
  const [files, setFiles] = useAtom(filesAtom);
  const [selectedFile, setSelectedFile] = useAtom(selectedFileAtom);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string>('');

  const loadFiles = async (repository: Repository, authToken: string) => {
    if (!repository || !authToken) return;

    setLoading(true);
    setError(null);
    try {
      const [owner, repo] = repository.fullName.split('/');
      const items = await fetchAllRepositoryFiles(owner, repo, authToken);
      setFiles(items);
      setFilteredFiles(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const selectFile = (file: FileItem | null) => {
    setSelectedFile(file);
  };

  const filterFiles = (query: string) => {
    if (query.trim() === '') {
      setFilteredFiles(files);
    } else {
      const fuse = new Fuse(files, {
        keys: ['name', 'path'],
        threshold: 0.3,
      });
      const results = fuse.search(query);
      setFilteredFiles(results.map(result => result.item));
    }
  };

  const downloadFile = async (file: FileItem, repository: Repository) => {
    if (!file.downloadUrl) return;

    selectFile(file);
    setIsDownloading(true);
    setDownloadStatus(`Downloading ${file.name}...`);

    try {
      await downloadAndSaveFile(
        file.downloadUrl,
        file.path,
        repository.fullName,
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
  };

  useEffect(() => {
    setFilteredFiles(files);
  }, [files]);

  return {
    files,
    selectedFile,
    filteredFiles,
    isLoading,
    error,
    isDownloading,
    downloadStatus,
    loadFiles,
    selectFile,
    filterFiles,
    downloadFile,
  };
};
