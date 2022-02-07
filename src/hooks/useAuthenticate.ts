import useLocalStorage from 'libs/useLocalStorage';
import { useCallback } from 'react';
import { useHistory } from 'react-router';
import useAPI from 'rest/useAPI';

const useAuthenticate = () => {
  const history = useHistory();

  const [token, saveToken] = useLocalStorage<String>('ssoToken', '');

  const isLoggedIn = !!token;

  const loginWithSSO = useCallback(
    async (ssoToken) => {
      if (!ssoToken) {
        return;
      }
      saveToken(ssoToken);
    },
    [history, saveToken]
  );

  const logout = useCallback(() => {
    saveToken('');
  }, []);

  return { loginWithSSO, logout, isLoggedIn };
};

export default useAuthenticate;
