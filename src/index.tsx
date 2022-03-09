import React, { StrictMode } from "react";
import { render } from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import "hooks/useContractsAddress";
import "./index.scss";
import ScrollToTop from "./layouts/ScrollToTop";
import Contract from "./layouts/Contract";
import App from "./layouts/App";
import Keplr from "libs/keplr";
import { network } from "constants/networks";
import AuthProvider from "providers/AuthProvider";

// enable Keplr
window.Keplr = new Keplr();

const checkKeplr = async () => {
  const keplr = await window.Keplr.getKeplr();
  if (keplr) {
    // always trigger suggest chain when users enter the webpage
    await window.Keplr.suggestChain(network.chainId);
  }
  render(
    <StrictMode>
      <Contract>
        <Router>
          <AuthProvider>
            <ScrollToTop />
            <App />
          </AuthProvider>
        </Router>
      </Contract>
    </StrictMode>,
    document.getElementById("oraiswap")
  );
};

checkKeplr();
