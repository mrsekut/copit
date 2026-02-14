import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { FilePreview } from './FilePreview.js';

type Item = {
  label: string;
  value: string;
  previewPath?: string;
};

type SelectListSplitPaneProps = {
  items: Item[];
  onSelect: (item: Item) => void;
  onHighlight?: (item: Item) => void;
  listLimit?: number;
  previewLines?: number;
  listWidth?: number;
  previewWidth?: number;
};

export const SelectListSplitPane: React.FC<SelectListSplitPaneProps> = ({
  items,
  onSelect,
  onHighlight,
  listLimit = 10,
  previewLines = 20,
  listWidth = 35,
  previewWidth = 50,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [windowStart, setWindowStart] = useState(0);

  const windowSize = Math.min(listLimit, items.length);

  useEffect(() => {
    setSelectedIndex(0);
    setWindowStart(0);
  }, [items.length]);

  useEffect(() => {
    if (selectedIndex < windowStart) {
      setWindowStart(selectedIndex);
    }
    if (selectedIndex >= windowStart + windowSize) {
      setWindowStart(selectedIndex - windowSize + 1);
    }
  }, [selectedIndex, windowStart, windowSize]);

  useEffect(() => {
    if (onHighlight && items[selectedIndex]) {
      onHighlight(items[selectedIndex]);
    }
  }, [selectedIndex, items, onHighlight]);

  useInput((_input, key) => {
    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    }
    if (key.downArrow) {
      setSelectedIndex(prev => Math.min(items.length - 1, prev + 1));
    }
    if (key.return) {
      if (items[selectedIndex]) {
        onSelect(items[selectedIndex]);
      }
    }
  });

  if (items.length === 0) {
    return <Text dimColor>No items</Text>;
  }

  const windowEnd = windowStart + windowSize;
  const visibleItems = items.slice(windowStart, windowEnd);
  const currentItem = items[selectedIndex];

  return (
    <Box flexDirection="row">
      {/* 左ペイン: リスト */}
      <Box
        flexDirection="column"
        width={listWidth}
        borderStyle="single"
        borderColor="gray"
        borderLeft={false}
        borderTop={false}
        borderBottom={false}
        paddingX={1}
      >
        <Text bold dimColor>
          Templates
        </Text>
        <Box marginTop={1} flexDirection="column">
          {visibleItems.map((item, index) => {
            const actualIndex = windowStart + index;
            const isSelected = actualIndex === selectedIndex;

            return (
              <Box key={item.value}>
                {isSelected ? (
                  <Text color="cyan" wrap="truncate">
                    ❯ {item.label}
                  </Text>
                ) : (
                  <Text wrap="truncate"> {item.label}</Text>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* 右ペイン: プレビュー */}
      <Box flexDirection="column" width={previewWidth} paddingX={1}>
        <Text bold dimColor>
          Preview
        </Text>
        <Box marginTop={1}>
          {currentItem?.previewPath ? (
            <FilePreview
              filePath={currentItem.previewPath}
              lines={previewLines}
              showBorder={false}
              maxWidth={previewWidth - 2}
            />
          ) : (
            <Text dimColor>No preview available</Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};
