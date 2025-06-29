import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import Fuse from 'fuse.js';
import { useAtom } from 'jotai';
import { viewAtom, searchQueryAtom } from '../store/atoms';
import { loadHistory, type HistoryItem } from './storage';
import { downloadAndSaveFile } from '../download/download';

export const HistoryList: React.FC = () => {
  const [, setView] = useAtom(viewAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string>('');

  useInput((input, key) => {
    if (key.tab) {
      setView('repositories');
      setSearchQuery('');
    }
  });

  useEffect(() => {
    const loadHistoryData = async () => {
      setIsLoading(true);
      try {
        const historyData = await loadHistory();
        setHistory(historyData);
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistoryData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredHistory(history);
    } else {
      const fuse = new Fuse(history, {
        keys: ['filePath', 'repositoryName'],
        threshold: 0.3,
      });
      const results = fuse.search(searchQuery);
      setFilteredHistory(results.map(result => result.item));
    }
  }, [searchQuery, history]);

  const handleSelect = async (item: { value: string }) => {
    const historyItem = history.find(h => h.id === item.value);
    if (!historyItem) return;

    setIsDownloading(true);
    setDownloadStatus(`Downloading ${historyItem.filePath}...`);

    try {
      await downloadAndSaveFile(
        historyItem.downloadUrl,
        historyItem.filePath,
        historyItem.repositoryName
      );
      setDownloadStatus(`✅ Downloaded: ${historyItem.filePath}`);
      
      // 履歴を再読み込み（順序が更新される）
      const updatedHistory = await loadHistory();
      setHistory(updatedHistory);
      
      setTimeout(() => {
        setDownloadStatus('');
      }, 2000);
    } catch (error) {
      setDownloadStatus(`❌ Failed to download: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <Box flexDirection="column">
        <Text>Loading history...</Text>
      </Box>
    );
  }

  const items = filteredHistory.map(item => ({
    label: `📄 ${item.repositoryName}/${item.filePath}`,
    value: item.id,
  }));

  // 画面の高さを考慮して表示数を制限
  const MAX_VISIBLE_ITEMS = 10;
  const limitedItems = items.slice(0, MAX_VISIBLE_ITEMS);
  const hasMore = items.length > MAX_VISIBLE_ITEMS;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Recent Files</Text>
        <Text dimColor> (Tab: Browse Repositories)</Text>
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
                ... and {items.length - MAX_VISIBLE_ITEMS} more files. Type to search.
              </Text>
            </Box>
          )}
        </>
      ) : (
        <Box flexDirection="column">
          <Text dimColor>No recent downloads found</Text>
          <Text dimColor>Download some files to see them here!</Text>
        </Box>
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