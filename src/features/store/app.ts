import { create } from 'zustand';
import type { Repository, FileItem } from '../github/api';

type View = 'repositories' | 'files';

type AppState = {
  view: View;
  username: string;
  repositories: Repository[];
  selectedRepository: Repository | null;
  files: FileItem[];
  selectedFile: FileItem | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
};

type AppActions = {
  setView: (view: View) => void;
  setUsername: (username: string) => void;
  setRepositories: (repositories: Repository[]) => void;
  selectRepository: (repository: Repository) => void;
  setFiles: (files: FileItem[]) => void;
  selectFile: (file: FileItem | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useAppStore = create<AppState & AppActions>((set) => ({
  view: 'repositories',
  username: 'mrsekut',
  repositories: [],
  selectedRepository: null,
  files: [],
  selectedFile: null,
  searchQuery: '',
  isLoading: false,
  error: null,

  setView: (view) => set({ view }),
  setUsername: (username) => set({ username }),
  setRepositories: (repositories) => set({ repositories }),
  selectRepository: (repository) => set({ selectedRepository: repository }),
  setFiles: (files) => set({ files }),
  selectFile: (file) => set({ selectedFile: file }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));