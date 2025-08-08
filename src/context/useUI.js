//Le hook de consommation//
import { useContext } from 'react';
import { UIContext } from './UIContext';

export function useUI() {
  return useContext(UIContext);
}
