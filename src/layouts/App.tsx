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
import { displayToast, TToastType } from 'components/Toasts/Toast';

const queryClient = new QueryClient();

const App = () => {
  const [address, setAddress] = useLocalStorage<string>('address');
  const { isLoading: isPairsLoading } = usePairs();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      if (!isPairsLoading) {
        setIsLoading(false);
      }
    }, 100);
  }, [isPairsLoading]);

  useEffect(() => {
    // add event listener here to prevent adding the same one everytime App.tsx re-renders
    window.addEventListener("keplr_keystorechange", keplrHandler);
  }, []);

  const keplrHandler = async () => {
    try {
      console.log("Key store in Keplr is changed. You may need to refetch the account info.");
      // automatically update. If user is also using Oraichain wallet => dont update
      const keplr = await window.Keplr.getKeplr();
      if (!keplr) throw "You must install Keplr to continue";
      const newAddress = await window.Keplr.getKeplrAddr();
      if (newAddress) setAddress(newAddress as string);
      window.location.reload();
    } catch (error) {
      console.log("Error: ", error);
      displayToast(TToastType.TX_INFO, { message: `There is an unexpected error with Keplr wallet. Please try again!` })
    }
  };

  const contract = useContractState(address);

  // can use ether.js as well, but ether.js is better for nodejs
  return (
    <ThemeProvider>
      <Web3ReactProvider getLibrary={(provider) => new Web3(provider)}>
        <ContractProvider value={contract}>
          <QueryClientProvider client={queryClient}>
            {!isLoading && routes()}
          </QueryClientProvider>
        </ContractProvider>
      </Web3ReactProvider>
    </ThemeProvider>
  );
};

export default App;
