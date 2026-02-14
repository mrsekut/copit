import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { promises as fs } from 'fs';

type FilePreviewProps = {
  filePath: string;
  lines?: number;
  showBorder?: boolean;
  maxWidth?: number;
};

const truncateLine = (line: string, maxWidth: number): string => {
  if (line.length <= maxWidth) return line;
  return line.slice(0, maxWidth - 3) + '...';
};

export const FilePreview: React.FC<FilePreviewProps> = ({
  filePath,
  lines = 5,
  showBorder = true,
  maxWidth,
}) => {
  const [content, setContent] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        const fileLines = data.split('\n').slice(0, lines);
        const truncatedLines = maxWidth
          ? fileLines.map(line => truncateLine(line, maxWidth))
          : fileLines;
        setContent(truncatedLines);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load file');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [filePath, lines, maxWidth]);

  if (isLoading) {
    return <Text dimColor>Loading...</Text>;
  }

  if (error) {
    return <Text color="red">Error: {error}</Text>;
  }

  const previewContent = (
    <Box flexDirection="column">
      {content.map((line, i) => (
        <Text key={i} dimColor>
          {line}
        </Text>
      ))}
    </Box>
  );

  if (showBorder) {
    return (
      <Box borderStyle="round" borderColor="gray" paddingX={1}>
        {previewContent}
      </Box>
    );
  }

  return previewContent;
};
