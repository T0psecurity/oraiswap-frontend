/* eslint-disable import/no-anonymous-default-export */
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spin } from 'antd';
// const Swap = React.lazy(() => import('pages/Swap/index'));
// const Pools = React.lazy(() => import('pages/Pools'));
const Balance = React.lazy(() => import('pages/Balance'));
const PoolDetail = React.lazy(() => import('pages/Pools/PoolDetail'));

export default () => {
  return (
    <Suspense fallback={<Spin className="spin" />}>
      <Routes>
        <Route path="/" element={<Balance />} />
        {/* <Route path="/swap" element={<Swap />} />
        <Route path="/pools" element={<Pools />} /> */}
        <Route path="/bridge" element={<Balance />} />
        <Route path="/pool/:namePool" element={<PoolDetail />} />
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Suspense>
  );
};
