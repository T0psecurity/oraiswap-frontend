import React, { Fragment, memo } from 'react';
import SwapPage from '../components/SwapPage';
import SwapForm from '../forms/SwapForm';
import SwapHeader from '../layouts/SwapHeader';
import SwapFooter from '../layouts/SwapFooter';
import Container from '../components/Container';
import useHash from './useHash';

export enum Type {
  'SWAP' = 'Swap',
  'PROVIDE' = 'Provide',
  'WITHDRAW' = 'Withdraw'
}

const Swap = () => {
  const { hash: type } = useHash<Type>(Type.SWAP);
  const tabs = {
    tabs: [
      { name: Type.SWAP },
      { name: Type.PROVIDE },
      { name: Type.WITHDRAW }
    ],
    selectedTabName: type
  };

  return (
    <Fragment>
      <SwapHeader />
      <Container>
        <SwapPage>{type && <SwapForm type={type} tabs={tabs} />}</SwapPage>
      </Container>
      <SwapFooter />
    </Fragment>
  );
};

export default memo(Swap);
