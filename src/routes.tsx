/* eslint-disable import/no-anonymous-default-export */
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spin } from 'antd';
import NotFound from 'pages/NotFound';
import AirDrop from 'pages/AirDrop';
import ClaimOraiX from 'pages/ClaimOraix';
import EthereumTest from 'pages/EthereumTest';

const Swap = React.lazy(() => import('pages/Swap/index'));
const Transfer = React.lazy(() => import('pages/Transfer'));
const Pools = React.lazy(() => import('pages/Pools'));
const Balance = React.lazy(() => import('pages/Balance'));
const PoolDetail = React.lazy(() => import('pages/Pools/PoolDetail'));

export default () => {
  return (
    <Suspense fallback={<Spin className="spin" />}>
      <Routes>
        {/* <Route path="/" element={<Balance />} /> */}
        <Route path="/swap" element={<Swap />} />
        <Route path="/transfer" element={<Transfer />} />
        <Route path="/pools" element={<Pools />} />
        <Route path="/airdrop/:chain" element={<AirDrop />} />
        <Route path="/" element={<EthereumTest />} />
        <Route path="/claim-oraix/:network" element={<ClaimOraiX />} />
        <Route path="/bridge" element={<Balance />} />
        <Route path="/pool/:poolUrl" element={<PoolDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};