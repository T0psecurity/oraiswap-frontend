import React, { useEffect, useState } from 'react';
import { ContractProvider, useContractState } from 'hooks/useContract';
import useLocalStorage from 'libs/useLocalStorage';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import usePairs from 'rest/usePairs';
import routes from 'routes';
import variables from 'styles/_variables.scss';
import { Web3ReactProvider } from '@web3-react/core';
import Web3 from 'web3';
import { ThemeProvider } from 'context/theme-context';
import './index.scss';
import Menu from './Menu';

const queryClient = new QueryClient();

const App = () => {
  const [address] = useLocalStorage<string>('address');
  const { isLoading: isPairsLoading } = usePairs();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      if (!isPairsLoading) {
        setIsLoading(false);
      }
    }, 100);
  }, [isPairsLoading]);

  const contract = useContractState(address);

  // can use ether.js as well, but ether.js is better for nodejs
  return (
    <ThemeProvider>
      <Web3ReactProvider getLibrary={(provider) => new Web3(provider)}>
        <ContractProvider value={contract}>
          <QueryClientProvider client={queryClient}>
            <div className="app">
              <Menu />
              {!isLoading && routes()}
            </div>
          </QueryClientProvider>
        </ContractProvider>
      </Web3ReactProvider>
    </ThemeProvider>
  );
};

export default App;
