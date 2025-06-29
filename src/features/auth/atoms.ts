import { atom } from 'jotai';

export const usernameAtom = atom('');
export const isAuthenticatedAtom = atom(false);
export const authTokenAtom = atom('');