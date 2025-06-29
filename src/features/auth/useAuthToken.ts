import { useAtomValue } from 'jotai';
import { usernameAtom, authTokenAtom } from './atoms.js';

export const useAuthToken = () => {
  const token = useAtomValue(authTokenAtom);
  const username = useAtomValue(usernameAtom);

  return {
    token,
    username,
  };
};
