import { atom } from 'jotai';

export type View = 'templates' | 'register';
export const viewAtom = atom<View>('templates');
