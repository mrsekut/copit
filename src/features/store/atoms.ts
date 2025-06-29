import { atom } from 'jotai';
import type { Repository, FileItem } from '../github/api';

export type View = 'repositories' | 'files';

export const viewAtom = atom<View>('repositories');
export const usernameAtom = atom('mrsekut');
export const repositoriesAtom = atom<Repository[]>([]);
export const selectedRepositoryAtom = atom<Repository | null>(null);
export const filesAtom = atom<FileItem[]>([]);
export const selectedFileAtom = atom<FileItem | null>(null);
export const searchQueryAtom = atom('');
export const isLoadingAtom = atom(false);
export const errorAtom = atom<string | null>(null);