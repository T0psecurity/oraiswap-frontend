//@ts-nocheck
import React, { useEffect, useRef } from 'react';
import url from 'url';
import classNames from 'classnames';
import styles from './LoginWidget.module.scss';
import useAuthenticate from 'hooks/useAuthenticate';

export const LoginWidget = ({ type = 'onPage', text, style = {} }) => {
  const { loginWithSSO } = useAuthenticate();
  const windowRef = useRef();

  useEffect(() => {
    const queryData = url.parse(window.location.href, {
      parseQueryString: true
    }).query;
    const handler = async (event) => {
      if (event.origin !== process.env.REACT_APP_SSO_ORIGIN) return;

      const receivedData = event.data;

      if (receivedData === 'logout') {
        window.wasm?.removeChildKey();
        return;
      }

      if (
        !receivedData ||
        typeof receivedData !== 'string' ||
        receivedData === 'ready' ||
        receivedData === 'logout'
      ) {
        return;
      }

      if (windowRef?.current) {
        windowRef.current.close();
      }
      if (window.lockLoginSSO) {
        return;
      }
      window.lockLoginSSO = true;
      try {
        const parsedData = JSON.parse(receivedData);
        await loginWithSSO(queryData.token, parsedData?.token);
      } catch (ex) {
        console.log(ex);
      }
      window.lockLoginSSO = false;
    };
    // Listen to event from sub-window
    const authentication = async () => {
      window.addEventListener('message', handler, false);

      return;
    };

    authentication();
    return () => {
      window.removeEventListener('message', handler);
    };
  }, []);

  return (
    <div className={classNames(styles.container)}>
      <iframe
        src={`${
          process.env.REACT_APP_SSO_SERVER
        }/login/embeded/${type}?serviceURL=${
          window.location.origin
        }&text=${text}&style=${JSON.stringify(style)}`}
      />
    </div>
  );
};

export default LoginWidget;
