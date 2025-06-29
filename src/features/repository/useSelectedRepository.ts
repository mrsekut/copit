import { useAtomValue } from 'jotai';
import { selectedRepositoryAtom } from './atoms.js';

export const useSelectedRepository = () => {
  const selectedRepository = useAtomValue(selectedRepositoryAtom);

  return selectedRepository;
};
