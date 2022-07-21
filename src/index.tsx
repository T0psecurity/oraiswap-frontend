import React, { StrictMode } from 'react';
import 'polyfill';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.scss';
import ScrollToTop from './layouts/ScrollToTop';
import App from './layouts/App';
import Keplr from 'libs/keplr';
import { network } from 'config/networks';
import { ToastProvider } from 'components/Toasts/context';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce, ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from 'react-query';
import Metamask from 'libs/metamask';
import {
  KWT_SUBNETWORK_CHAIN_ID,
  ORAI_BRIDGE_CHAIN_ID
} from 'config/constants';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// enable Keplr
window.Keplr = new Keplr();
window.Metamask = new Metamask();
const queryClient = new QueryClient();

if (process.env.REACT_APP_SENTRY_ENVIRONMENT) {
  Sentry.init({
    environment: process.env.REACT_APP_SENTRY_ENVIRONMENT,
    dsn: 'https://763cf7889ff3440d86c7c1fbc72c8780@o1323226.ingest.sentry.io/6580749',
    integrations: [new BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0
  });
}

const startApp = async () => {
  try {
    const keplr = await window.Keplr.getKeplr();
    // suggest our chain
    if (keplr) {
      // always trigger suggest chain when users enter the webpage
      await window.Keplr.suggestChain(network.chainId);
      await window.Keplr.suggestChain(ORAI_BRIDGE_CHAIN_ID);
      await window.Keplr.suggestChain(KWT_SUBNETWORK_CHAIN_ID);
    }
  } catch (ex) {
    console.log(ex);
  }

  render(
    <StrictMode>
      <ToastProvider>
        <Router>
          <ScrollToTop />
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </Router>
        <ToastContainer transition={Bounce} />
      </ToastProvider>
    </StrictMode>,
    document.getElementById('oraiswap')
  );
};

window.addEventListener('error', (event) => {
  alert(JSON.stringify(event))
});

startApp();
