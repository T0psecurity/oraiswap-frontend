import Big from 'big.js';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import axios from 'rest/request';
import Loader from 'components/Loader';
import useGlobalState from 'hooks/useGlobalState';
import { displayToast, TToastType } from 'components/Toasts/Toast';
import bech32 from 'bech32';
import { ORAI, ORAIX_CLAIM_CONTRACT, ORAIX_CLAIM_URL, ORAIX_DENOM } from 'config/constants';
import Content from 'layouts/Content';
import { parseAmountFromWithDecimal, reduceString } from 'libs/utils';
import { network } from 'config/networks';
import { generateClaimMsg, Type } from 'rest/api';
import CosmJs from 'libs/cosmjs';

const objNetwork = {
  osmo: { network: 'osmo', stage: 4 },
  orai: { network: 'orai', stage: 2 },
  airi: { network: 'orai', stage: 1 },
  juno: { network: 'juno', stage: 3 },
  cosmos: { network: 'cosmos', stage: 5 },
};

const ClaimOraiX: FunctionComponent = () => {
  const [claimLoading, setClaimLoading] = useState(false);
  const [address] = useGlobalState('address');
  const { network: userNetwork } = useParams();
  const networkConvert = objNetwork[userNetwork as keyof typeof objNetwork].network || ORAI;
  const getAddressStrFromAnotherAddr = (address: string) => {
    const fullWords = bech32.decode(address);
    if (fullWords.words) {
      return bech32.encode(networkConvert, fullWords.words);
    }
  };

  const useQueryConfig = { enabled: !!address, retry: 1, retryDelay: 3000, refetchOnMount: false, refetchOnWindowFocus: false, refetchOnReconnect: false };

  const handleClaim = async () => {
    try {
      setClaimLoading(true);

      // get merkle proof
      const { data: proofs } = await fetchProof();
      const msg = generateClaimMsg({ type: Type.CLAIM_ORAIX, sender: address, stage: objNetwork[userNetwork as keyof typeof objNetwork].stage, amount: oraiXAmount, proofs });

      const result = await CosmJs.execute({
        prefix: ORAI,
        address: msg.contract,
        walletAddr: address,
        handleMsg: msg.msg.toString(),
        gasAmount: { denom: ORAI, amount: '0' },
      });
      console.log('result swap tx hash: ', result);

      setTimeout(() => {
        displayToast(TToastType.TX_SUCCESSFUL, {
          customLink: `${network.explorer}/txs/${result.transactionHash}`,
        });
        setClaimLoading(false);
      }, 5000);
    } catch (error: any) {
      console.log('error message handle claim: ', error);
      return displayToast(TToastType.TX_FAILED, {
        message: error.message,
      });
    }
  };

  const { data: oraiXAmount, isLoading: isLoading } = useQuery(
    ['claim-oraix'],
    () => fetchClaimOraiX(), useQueryConfig
  );

  const { data: isClaimed, isLoading: isClaimedLoading } = useQuery(
    ['is-claimed'],
    () => fetchIsClaimed(), useQueryConfig
  );

  async function fetchClaimOraiX() {
    const { data: amount } = (await axios.get(`${ORAIX_CLAIM_URL}/proof/amount/${userNetwork}?address=${address}`)).data;
    console.log("res: ", amount)

    return amount;
  }

  async function fetchIsClaimed() {
    const msg = JSON.stringify({
      is_claimed: {
        address,
        stage: objNetwork[userNetwork as keyof typeof objNetwork].stage
      }
    });
    const { data } = (await axios.get(`${network.lcd}/wasm/v1beta1/contract/${ORAIX_CLAIM_CONTRACT}/smart/${btoa(msg)}`)).data;
    console.log("data is claimed: ", data.is_claimed)

    return data.is_claimed;
  }

  async function fetchProof() {
    const res: any = (await axios.get(`${ORAIX_CLAIM_URL}/proof/${userNetwork}?address=${address}&amount=${oraiXAmount}`)).data;
    return res;
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
        {address && !!networkConvert && (
          <>
            <div style={{ wordWrap: 'break-word' }}>{`${userNetwork!.toUpperCase()} address: ${address && reduceString(getAddressStrFromAnotherAddr(address)!, networkConvert.length + 5, 10)
              }`}</div>
            {!isLoading && !!oraiXAmount && <div> {`Claim amount: ${parseAmountFromWithDecimal(parseInt(oraiXAmount), 6).toString()} ${ORAIX_DENOM}`}</div>}
            {!isClaimedLoading &&
              <div>
                <div> {`Is claimed: ${isClaimed}`}</div>
                {!isClaimed &&
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
                      {claimLoading && <div style={{ marginRight: 5 }}><Loader width={25} height={25} /></div>}
                      <div>Claim {ORAIX_DENOM}</div>
                    </div>
                  </button>}
              </div>
            }
          </>
        )}
      </div>
    </Content >
  );
};

export default ClaimOraiX;
