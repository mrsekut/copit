import { atom } from 'jotai';
import type { FileItem } from '../github/api.js';

export const filesAtom = atom<FileItem[]>([]);
export const selectedFileAtom = atom<FileItem | null>(null);