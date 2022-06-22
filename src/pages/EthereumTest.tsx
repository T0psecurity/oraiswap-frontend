import { FunctionComponent, useEffect, useState } from 'react';
import Loader from 'components/Loader';
import { displayToast, TToastType } from 'components/Toasts/Toast';
import Content from 'layouts/Content';
import Web3 from 'web3';

const EthereumTest: FunctionComponent = () => {
  const [claimLoading, setClaimLoading] = useState(false);

  // useEffect(() => {
  //   window.ReactNativeWebView.postMessage("hello")
  // }, [])

  const handleClaim = async () => {
    try {
      setClaimLoading(true);

      console.log('window ethereum: ', parseInt('100', 16));
      window.ReactNativeWebView?.postMessage(String(window.ethereum));

      const web3 = new Web3(window.ethereum);

      const nonce = await window.ethereum.request({
        method: 'eth_getTransactionCount',
        params: ['0x3C5C6b570C1DA469E8B24A2E8Ed33c278bDA3222', 'latest'],
        rpc: 'https://endpoint1.kawaii.global',
      });
      alert(`nonce: ${nonce}`);

      // const accounts = await window.ethereum.request({
      //   method: 'eth_accounts',
      //   params: [],
      //   chainId: 'kawaii_6886-1',
      // });
      // alert(`accounts: ${accounts}`);

      const result = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: '0x3C5C6b570C1DA469E8B24A2E8Ed33c278bDA3222',
            to: '0x3C5C6b570C1DA469E8B24A2E8Ed33c278bDA3222',
            value: web3.utils.toHex(1),
          },
        ],
        chainId: 'kawaii_6886-1',
        signer: '0x3C5C6b570C1DA469E8B24A2E8Ed33c278bDA3222',
      });

      console.log('result: ', result);

      displayToast(TToastType.TX_SUCCESSFUL, {
        customLink: `https://scan.kawaii.global/tx/${result}`,
      });
    } catch (error: any) {
      console.log('error message handle claim: ', error);
      return displayToast(TToastType.TX_FAILED, {
        message: error.message,
      });
    }
    setClaimLoading(false);
  };

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
        <button
          style={{
            background: '#612fca',
            boxShadow: 'inset 0px -2px 0px #4b2993, inset 1px 2px 0px #804af2',
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
            {claimLoading && (
              <div style={{ marginRight: 5 }}>
                <Loader width={25} height={25} />
              </div>
            )}
          </div>
        </button>
      </div>
    </Content>
  );
};

export default EthereumTest;
