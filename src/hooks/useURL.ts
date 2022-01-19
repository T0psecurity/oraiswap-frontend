import { useCallback } from 'react';

const toQueryMsg = (msg: string) => {
  try {
    return JSON.stringify(JSON.parse(msg));
  } catch (error) {
    return '';
  }
};

export default () => {
  const getUrl = useCallback((contract: string, msg: string | object) => {
    const query_msg =
      typeof msg === 'string'
        ? toQueryMsg(msg)
        : encodeURIComponent(JSON.stringify(msg));
    return `${process.env.REACT_APP_LCD}/wasm/contracts/${contract}/store?query_msg=${query_msg}`;
  }, []);
  return getUrl;
};
