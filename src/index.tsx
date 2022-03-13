import React, { StrictMode } from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import 'hooks/useContractsAddress';
import './index.scss';
import ScrollToTop from './layouts/ScrollToTop';
import Contract from './layouts/Contract';
import App from './layouts/App';
import Keplr from 'libs/keplr';
import { network } from 'constants/networks';
import AuthProvider from 'providers/AuthProvider';
import { ToastProvider } from 'components/Toasts/context';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce, ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from "react-query";

// enable Keplr
window.Keplr = new Keplr();
const queryClient = new QueryClient();

const checkKeplr = async () => {
  const keplr = await window.Keplr.getKeplr();
  if (keplr) {
    // always trigger suggest chain when users enter the webpage
    await window.Keplr.suggestChain(network.chainId);
  }
  render(
    <StrictMode>
      <Contract>
        <ToastProvider>
          <Router>
            <AuthProvider>
              <ScrollToTop />
              <App />
            </AuthProvider>
          </Router>
          <ToastContainer transition={Bounce} />
        </ToastProvider>
      </Contract>
    </StrictMode>,
    document.getElementById('oraiswap')
  );
};

checkKeplr();
