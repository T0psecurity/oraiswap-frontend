// @ts-nocheck
import Web3 from 'web3';
import tokenABI from 'constants/abi/erc20.json';
import { emvTokens } from 'constants/bridgeTokens';

const EthereumChainId = '0x1';
const BscChainId = '0x38';

const ethNetworks = {
  [EthereumChainId]: {
    ORAI: '0x4c11249814f11b9346808179cf06e71ac328c1b5'
  },
  [BscChainId]: {
    ORAI: '0xA325Ad6D9c92B55A3Fc5aD7e412B1518F96441C0'
  }
};

export default class Metamask {
  constructor() {}

  public isBsc() {
    return window.ethereum?.chainId === BscChainId;
  }

  public async getOraiBalance(address: string, denom: string) {
    const ethNetwork = ethNetworks[window.ethereum?.chainId];
    if (!ethNetwork || !window.ethereum) return '0';

    let provider;
    if (denom) {
      const token = emvTokens.find((item) => item.denom === denom);
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
