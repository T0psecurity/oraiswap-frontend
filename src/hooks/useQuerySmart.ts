import { useCallback } from 'react';
import { Buffer } from 'buffer';
import { network } from 'constants/networks';
import axios from 'axios';

const toQueryMsg = (msg: string) => {
  try {
    return Buffer.from(JSON.stringify(JSON.parse(msg))).toString('base64');
  } catch (error) {
    return '';
  }
};

export default () => {
  const querySmart = useCallback(
    async (contract: string, msg: string | object) => {
      const params =
        typeof msg === 'string'
          ? toQueryMsg(msg)
          : Buffer.from(JSON.stringify(msg)).toString('base64');
      const url = `${network.lcd}/wasm/v1beta1/contract/${contract}/smart/${params}`;

      const res = (await axios.get(url)).data;
      if (res.code) throw new Error(res.message);
      return res.data;
    },
    []
  );
  return querySmart;
};
