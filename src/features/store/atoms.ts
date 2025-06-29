import { atom } from 'jotai';
import type { FileItem } from '../github/api';

export type View = 'repositories' | 'files' | 'history';
export const viewAtom = atom<View>('history');

export const filesAtom = atom<FileItem[]>([]);
export const selectedFileAtom = atom<FileItem | null>(null);
export const searchQueryAtom = atom('');
export const isLoadingAtom = atom(false);
export const errorAtom = atom<string | null>(null);
