import React, { StrictMode } from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.scss';
// import ScrollToTop from './layouts/ScrollToTop';
// import Contract from './layouts/Contract';
// import App from './layouts/App';
// import WalletConnectProvider from './layouts/WalletConnectProvider';

render(
  <StrictMode>
    {/* <WalletConnectProvider>
      <Contract>
        <Router>
          <ScrollToTop />
          <App />
        </Router>
      </Contract>
    </WalletConnectProvider> */}
    <h1>home</h1>
  </StrictMode>,
  document.getElementById('oraiswap')
);
