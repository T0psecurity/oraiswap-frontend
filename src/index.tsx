import React, { StrictMode } from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.scss';
import ScrollToTop from './layouts/ScrollToTop';
import App from './layouts/App';
import Keplr from 'libs/keplr';
import { network } from 'constants/networks';
import AuthProvider from 'providers/AuthProvider';
import { ToastProvider } from 'components/Toasts/context';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce, ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from 'react-query';

// enable Keplr
window.Keplr = new Keplr();
const queryClient = new QueryClient();

const startApp = async () => {
  try {
    const keplr = await window.Keplr.getKeplr();
    // suggest our chain
    if (keplr) {
      // always trigger suggest chain when users enter the webpage
      await window.Keplr.suggestChain(network.chainId);
      await window.Keplr.suggestChain('columbus-5');
      // init address for first time open
      const address = await window.Keplr.getKeplrAddr(network.chainId);
      window.localStorage.setItem('address', JSON.stringify(address));
    }
  } catch (ex) {
    console.log(ex);
  }

  render(
    <StrictMode>
      <ToastProvider>
        <Router>
          <AuthProvider>
            <ScrollToTop />
            <QueryClientProvider client={queryClient}>
              <App />
            </QueryClientProvider>
          </AuthProvider>
        </Router>
        <ToastContainer transition={Bounce} />
      </ToastProvider>
    </StrictMode>,
    document.getElementById('oraiswap')
  );
};

startApp();
