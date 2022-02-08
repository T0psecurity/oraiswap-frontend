import React, { useEffect, useState } from 'react';
import { ContractProvider, useContractState } from 'hooks/useContract';
import useLocalStorage from 'libs/useLocalStorage';

import Header from './Header';
import Footer from './Footer';
import usePairs from 'rest/usePairs';
import routes from 'routes';
import { ThemeProvider } from 'styled-components';
import variables from 'styles/_variables.scss';
import { useContractsAddress } from 'hooks';

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

  return (
    <ThemeProvider theme={variables}>
      <Header />
      <ContractProvider value={contract}>
        {!isLoading && routes()}
      </ContractProvider>
      <Footer />
    </ThemeProvider>
  );
};

export default App;
