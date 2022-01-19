import React, { FC } from 'react';
import { useContractsAddressState } from '../hooks/useContractsAddress';
import { ContractsAddressProvider } from '../hooks/useContractsAddress';
import { useContractsAddressTokenState } from '../hooks/useContractsAddressToken';
import { ContractsAddressTokenProvider } from '../hooks/useContractsAddressToken';

const Contract: FC = ({ children }) => {
  const contractsAddress = useContractsAddressState();
  const contractsAddressToken = useContractsAddressTokenState();
  console.log(contractsAddress);
  return !contractsAddress ? null : (
    <ContractsAddressProvider value={contractsAddress}>
      <ContractsAddressTokenProvider value={contractsAddressToken}>
        {children}
      </ContractsAddressTokenProvider>
    </ContractsAddressProvider>
  );
};

export default Contract;
