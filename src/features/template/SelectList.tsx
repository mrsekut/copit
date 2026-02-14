import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

type Item = {
  label: string;
  value: string;
};

type SelectListProps = {
  items: Item[];
  onSelect: (item: Item) => void;
  onHighlight?: (item: Item) => void;
  limit?: number;
};

export const SelectList: React.FC<SelectListProps> = ({
  items,
  onSelect,
  onHighlight,
  limit = 10,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [windowStart, setWindowStart] = useState(0);

  const windowSize = Math.min(limit, items.length);

  // アイテムが変わったらリセット
  useEffect(() => {
    setSelectedIndex(0);
    setWindowStart(0);
  }, [items.length]);

  // ウィンドウのスクロール調整
  useEffect(() => {
    // カーソルがウィンドウより上にある場合
    if (selectedIndex < windowStart) {
      setWindowStart(selectedIndex);
    }
    // カーソルがウィンドウより下にある場合
    if (selectedIndex >= windowStart + windowSize) {
      setWindowStart(selectedIndex - windowSize + 1);
    }
  }, [selectedIndex, windowStart, windowSize]);

  // ハイライト通知
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
    return null;
  }

  const windowEnd = windowStart + windowSize;
  const visibleItems = items.slice(windowStart, windowEnd);

  return (
    <Box flexDirection="column">
      {visibleItems.map((item, index) => {
        const actualIndex = windowStart + index;
        const isSelected = actualIndex === selectedIndex;

        return (
          <Box key={item.value}>
            {isSelected ? (
              <Text color="cyan">❯ {item.label}</Text>
            ) : (
              <Text>  {item.label}</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
