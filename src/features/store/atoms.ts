import { atom } from 'jotai';
import type { Repository, FileItem } from '../github/api';

export type View = 'repositories' | 'files' | 'history';

export const viewAtom = atom<View>('history');
export const usernameAtom = atom('');
export const isAuthenticatedAtom = atom(false);
export const authTokenAtom = atom('');
export const repositoriesAtom = atom<Repository[]>([]);
export const selectedRepositoryAtom = atom<Repository | null>(null);
export const filesAtom = atom<FileItem[]>([]);
export const selectedFileAtom = atom<FileItem | null>(null);
export const searchQueryAtom = atom('');
export const isLoadingAtom = atom(false);
export const errorAtom = atom<string | null>(null);
