import useLocalStorage from 'libs/useLocalStorage';
import { useEffect, useState } from 'react';

import useAPI from './useAPI';

interface DenomBalanceResponse {
  height: string;
  result: DenomInfo[];
}

interface DenomInfo {
  denom: string;
  amount: string;
}

interface ContractBalanceResponse {
  height: string;
  result: ContractBalance;
}

interface ContractBalance {
  balance: string;
}

export default (contract_addr: string, symbol: string) => {
  const [address] = useLocalStorage<string>('address');

  const { loadDenomBalance, loadContractBalance } = useAPI();

  const localContractAddr = contract_addr;
  const localSymbol = symbol;

  const [balance, setBalance] = useState<string>();
  useEffect(() => {
    try {
      if (
        localContractAddr === '' ||
        localContractAddr === undefined ||
        !localContractAddr.match(/^orai\w+/)
      ) {
        loadDenomBalance().then((denomInfos) => {
          let hasDenom: boolean = false;
          if (denomInfos !== undefined) {
            denomInfos.forEach((denomInfo: DenomInfo) => {
              if (denomInfo.denom === localContractAddr) {
                setBalance(denomInfo.amount);
                hasDenom = true;
              }
            });
          }
          if (hasDenom === false) {
            setBalance('');
          }
        });
      } else {
        loadContractBalance(localContractAddr).then((tokenBalance) => {
          tokenBalance ? setBalance(tokenBalance.balance) : setBalance('');
        });
      }
    } catch (error) {
      setBalance('');
    }
  }, [
    address,
    contract_addr,

    loadContractBalance,
    loadDenomBalance,
    localContractAddr,
    localSymbol,
    symbol
  ]);

  return { balance };
};
