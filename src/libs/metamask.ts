// @ts-nocheck
import Web3 from 'web3';
import tokenABI from 'constants/abi/erc20.json';
import { evmTokens } from 'constants/bridgeTokens';
import { BSC_CHAIN_ID, ETHEREUM_CHAIN_ID, ORAI_BSC_CONTRACT, ORAI_ETH_CONTRACT } from 'constants/constants';

const ethNetworks = {
  [ETHEREUM_CHAIN_ID]: {
    ORAI: ORAI_ETH_CONTRACT
  },
  [BSC_CHAIN_ID]: {
    ORAI: ORAI_BSC_CONTRACT
  }
};

export default class Metamask {
  constructor() { }

  public isBsc() {
    return window.ethereum?.chainId === BSC_CHAIN_ID;
  }

  public async getOraiBalance(address: string, denom: string) {
    const ethNetwork = ethNetworks[window.ethereum?.chainId];
    if (!ethNetwork || !window.ethereum) return '0';

    let provider;
    if (denom) {
      const token = evmTokens.find((item) => item.denom === denom);
      provider = token?.rpc;
    }
    const web3 = new Web3(provider || window.ethereum);
    try {
      const tokenInst = new web3.eth.Contract(tokenABI, ethNetwork.ORAI);
      const balance = await tokenInst.methods.balanceOf(address).call();
      return balance;
    } catch (ex) {
      return '0';
    }
  }
}
