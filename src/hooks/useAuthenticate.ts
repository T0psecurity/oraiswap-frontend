import useLocalStorage from 'libs/useLocalStorage';
import { useCallback } from 'react';
import { useHistory } from 'react-router';
import useAPI from 'rest/useAPI';

const useAuthenticate = () => {
  const { signinWithSSOToken } = useAPI();
  const history = useHistory();

  const [token, saveToken] = useLocalStorage<String>('ssoToken', '');

  const isLoggedIn = !!token;

  const loginWithSSO = useCallback(
    async (orgToken, ssoToken) => {
      if (!ssoToken) {
        return;
      }

      const data = await signinWithSSOToken({
        accessToken: ssoToken,
        orgToken
      });

      saveToken(data?.token);
      // history.replace("/projects");
    },
    [history, saveToken]
  );

  const logout = useCallback(() => {
    saveToken('');
  }, []);

  return { loginWithSSO, logout, isLoggedIn };
};

export default useAuthenticate;
