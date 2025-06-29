import { atom } from 'jotai';

export type View = 'repositories' | 'files' | 'history';
export const viewAtom = atom<View>('history');

export const searchQueryAtom = atom('');
export const isLoadingAtom = atom(false);
export const errorAtom = atom<string | null>(null);
