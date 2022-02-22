import React, { StrictMode } from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import 'hooks/useContractsAddress';
import './index.scss';
import ScrollToTop from './layouts/ScrollToTop';
import Contract from './layouts/Contract';
import App from './layouts/App';
import { network } from 'constants/networks';

// enable Keplr
window.keplr.enable(network.chainId);

render(
  <StrictMode>
    <Contract>
      <Router>
        <ScrollToTop />
        <App />
      </Router>
    </Contract>
  </StrictMode>,
  document.getElementById('oraiswap')
);
