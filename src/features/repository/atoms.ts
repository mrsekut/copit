import { atom } from 'jotai';
import type { Repository } from '../github/api.js';

export const repositoriesAtom = atom<Repository[]>([]);
export const selectedRepositoryAtom = atom<Repository | null>(null);