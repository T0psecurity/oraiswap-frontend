import { createGlobalState } from 'react-hooks-global-state';

const initialState = { address: '' };
const { useGlobalState } = createGlobalState(initialState);

export default useGlobalState;
