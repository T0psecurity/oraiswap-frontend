import Big from 'big.js';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import axios from 'rest/request';
import Loader from 'components/Loader';
import useGlobalState from 'hooks/useGlobalState';
import { displayToast, TToastType } from 'components/Toasts/Toast';
import bech32 from 'bech32';
import { ORAI, ORAIX_DENOM } from 'config/constants';
import Content from 'layouts/Content';

const objNetwork = {
  osmo: 'osmo',
  orai: 'orai',
  airi: 'orai',
  juno: 'juno',
  cosmos: 'cosmos',
};

const ClaimOraiX: FunctionComponent = () => {
  const [claimLoading, setClaimLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const addr = useGlobalState('address');
  const { network } = useParams();
  const networkConvert = objNetwork[network] || ORAI;
  const getAddressStrFromAnotherAddr = (address) => {
    const fullWords = bech32.decode(address);
    if (fullWords.words) {
      return bech32.encode(networkConvert, fullWords.words);
    }
  };

  useEffect(() => {
    console.log('get amount from api ');
    setAmount(0);
  }, [network]);

  const handleClaim = () => {
    try {
      setClaimLoading(true);
      setTimeout(() => {
        displayToast(TToastType.TX_SUCCESSFUL, {
          customLink: ``,
        });
        setClaimLoading(false);
      }, 5000);
    } catch (error) {
      console.log('error message handle claim: ', error);
      return displayToast(TToastType.TX_FAILED, {
        message: error.message,
      });
    }
  };

  const { data: claimOraiX, isLoading: isLoading } = useQuery(
    ['claim-oraix'],
    () => fetchClaimOraiX()
  );

  async function fetchClaimOraiX() {
    // let url = `https://airdrop-api.oraidex.io/${chain}/delegator/${addr}`;
    // const res: any = (await axios.get(url)).data;
    // return { delegatedAmount: parseAmount(res.delegated), undelegatedAmount: parseAmount(res.undelegated), available: parseAmount(res.available) };
  }

  return (
    <Content>
      <div
        style={{
          width: '100%',
          height: '100%',
          textAlign: 'center',
          margin: 'auto 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center', 
          flexDirection: 'column',
          fontSize: 20,
        }}
      >
        {addr?.[0] && !!networkConvert && (
          <>
            <div>{`${network.toUpperCase()} address: ${
              addr?.[0] && getAddressStrFromAnotherAddr(addr?.[0])
            }`}</div>
            <div>{`Amount: ${amount} ${ORAIX_DENOM}`}</div>
            <button
              style={{
                background: '#612fca',
                boxShadow:
                  'inset 0px -2px 0px #4b2993, inset 1px 2px 0px #804af2',
                padding: 16,
                borderRadius: 10,
                color: '#ffffff',
                cursor: 'pointer',
                height: 60,
                fontWeight: 600,
                fontFamily: 'IBM Plex Sans',
                margin: '20px 0',
                width: 200,
              }}
              onClick={handleClaim}
              disabled={claimLoading}
            >
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {claimLoading && <Loader width={40} height={40} />}
                <div>Claim {ORAIX_DENOM}</div>
              </div>
            </button>
          </>
        )}
      </div>
    </Content>
  );
};

export default ClaimOraiX;
