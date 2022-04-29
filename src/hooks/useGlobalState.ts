import { createGlobalState } from 'react-hooks-global-state';

export type GlobalState = {
  address: string;
  metamaskAddress: string | null;
};

const initialState: GlobalState = { address: '', metamaskAddress: '' };
const { useGlobalState } = createGlobalState(initialState);

export default useGlobalState;
