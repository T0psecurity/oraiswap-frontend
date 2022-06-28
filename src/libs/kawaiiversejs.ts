import { collectWallet } from './cosmjs';
import { StargateClient } from '@cosmjs/stargate';
import { kawaiiTokens } from 'config/bridgeTokens';
import { KAWAII_API_DEV, KAWAII_CONTRACT, KAWAII_LCD } from 'config/constants';
import {
  createMessageConvertCoin,
  createMessageConvertERC20,
  createTxIBCMsgTransfer,
  createMessageConvertIbcTransferERC20
} from '@oraichain/kawaiiverse-txs';
import Long from 'long';
import { createTxRaw } from '@tharsis/proto';
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import axios from 'rest/request';

async function getAccountInfo(accAddress: string) {
  return await fetch(
    `${KAWAII_LCD}/cosmos/auth/v1beta1/accounts/${accAddress}`,
    { method: 'GET' }
  ).then((data) => data.json());
}

// chain id format: something_1234-3
function parseChainIdNumber(chainId: string) {
  return parseInt(chainId.split('_')[1].split('-')[0]);
}

async function getSenderInfo(sender: string, pubkey: Uint8Array) {
  const accountInfo = await getAccountInfo(sender);

  return {
    accountAddress: sender,
    sequence: parseInt(accountInfo.account.base_account.sequence),
    accountNumber: parseInt(accountInfo.account.base_account.account_number),
    pubkey: Buffer.from(pubkey).toString('base64'),
  };
}

async function getWallet(chainId: string) {
  if (await window.Keplr.getKeplr()) await window.Keplr.suggestChain(chainId);
  else throw 'Cannot get Keplr to get account';

  const wallet = await collectWallet(chainId) as OfflineDirectSigner;
  const accounts = await wallet.getAccounts();
  return { accounts, wallet };
}

async function submit({
  wallet,
  signDirect,
  chainId,
  rpc,
  accountNumber,
  signer,
}: {
  wallet: OfflineDirectSigner;
  signDirect: any;
  chainId: string;
  rpc: string;
  accountNumber: number;
  signer: string;
}) {
  const bodyBytes = signDirect.body.serialize();
  const authInfoBytes = signDirect.authInfo.serialize();
  const signResult = await wallet.signDirect(signer, {
    bodyBytes,
    authInfoBytes,
    chainId,
    accountNumber: new Long(accountNumber),
  });
  const signature = Buffer.from(signResult.signature.signature, 'base64');
  const txRaw = createTxRaw(
    signResult.signed.bodyBytes,
    signResult.signed.authInfoBytes,
    [signature]
  ).message.serialize();
  const client = await StargateClient.connect(rpc);
  const result = await client.broadcastTx(txRaw);
  return result;
}

export default class KawaiiverseJs {
  /**
   * A wrapper method to execute a msg convert coin feature
   * @param args - an object containing essential parameters to execute msg convert coin
   * @returns - transaction hash after executing the msg convert coin
   */
  static async convertCoin({
    sender,
    gasAmount,
    gasLimits = { exec: 2400000 },
    coin,
  }: {
    sender: string;
    gasAmount: { amount: string; denom: string };
    gasLimits?: { exec: number };
    coin: { amount: string; denom: string };
  }) {
    try {
      const subnetwork = kawaiiTokens[0];
      const chainIdNumber = parseChainIdNumber(subnetwork.chainId);

      const { wallet, accounts } = await getWallet(subnetwork.chainId);

      const fee = { ...gasAmount, gas: gasLimits.exec.toString() };

      const senderInfo = await getSenderInfo(sender, accounts[0].pubkey);
      const { address_eth } = await (
        await axios.get(
          `${KAWAII_API_DEV}/mintscan/v1/account/cosmos-to-eth/${senderInfo.accountAddress}`
        )
      ).data;

      const params = {
        destinationAddress: address_eth,
        amount: coin.amount.toString(),
        denom: coin.denom.toString(),
      };

      const { signDirect } = createMessageConvertCoin(
        { chainId: chainIdNumber, cosmosChainId: subnetwork.chainId },
        senderInfo,
        fee,
        `sender - ${senderInfo.accountAddress}; receiver - ${params.destinationAddress}`,
        params
      );

      return submit({
        wallet,
        signDirect,
        chainId: subnetwork.chainId,
        rpc: subnetwork.rpc,
        accountNumber: senderInfo.accountNumber,
        signer: senderInfo.accountAddress,
      });
    } catch (error) {
      console.log('error in converting coin: ', error);
      throw error;
    }
  }

  /**
   * A wrapper method to execute a msg convert coin feature
   * @param args - an object containing essential parameters to execute msg convert coin
   * @returns - transaction hash after executing the msg convert coin
   */
  static async convertERC20({
    sender,
    gasAmount,
    gasLimits = { exec: 2400000 },
    amount,
  }: {
    sender: string;
    gasAmount: { amount: string; denom: string };
    gasLimits?: { exec: number };
    amount: string;
  }) {
    try {
      const subnetwork = kawaiiTokens[0];
      const chainIdNumber = parseChainIdNumber(subnetwork.chainId);

      const { wallet, accounts } = await getWallet(subnetwork.chainId);

      const fee = { ...gasAmount, gas: gasLimits.exec.toString() };

      let senderInfo = await getSenderInfo(sender, accounts[0].pubkey);

      const params = {
        contractAddress: KAWAII_CONTRACT,
        destinationAddress: sender, // we want to convert erc20 token from eth address to native token with native address => use native sender address
        amount,
      };

      const { address_eth } = await (
        await axios.get(
          `${KAWAII_API_DEV}/mintscan/v1/account/cosmos-to-eth/${senderInfo.accountAddress}`
        )
      ).data;
      senderInfo.accountAddress = address_eth;

      const { signDirect } = createMessageConvertERC20(
        { chainId: chainIdNumber, cosmosChainId: subnetwork.chainId },
        senderInfo,
        fee,
        `sender - ${senderInfo.accountAddress}; receiver - ${params.destinationAddress}`,
        params
      );

      return submit({
        wallet,
        signDirect,
        chainId: subnetwork.chainId,
        rpc: subnetwork.rpc,
        accountNumber: senderInfo.accountNumber,
        signer: sender,
      });
    } catch (error) {
      console.log('error in converting ERC20: ', error);
      throw error;
    }
  }

  static async transferIBC({
    sender,
    gasAmount,
    gasLimits = { exec: 2400000 },
    ibcInfo,
  }: {
    sender: string;
    gasAmount: { amount: string; denom: string };
    gasLimits?: { exec: number };
    ibcInfo: {
      sourcePort: string;
      sourceChannel: string;
      amount: string;
      denom: string;
      sender: string;
      receiver: string;
      timeoutTimestamp: number;
    };
  }) {
    try {
      const subnetwork = kawaiiTokens[0];
      const chainIdNumber = parseChainIdNumber(subnetwork.chainId);

      const { wallet, accounts } = await getWallet(subnetwork.chainId);

      const fee = { ...gasAmount, gas: gasLimits.exec.toString() };

      const senderInfo = await getSenderInfo(sender, accounts[0].pubkey);

      const params = {
        ...ibcInfo,
        timeoutTimestamp: Long.fromNumber(ibcInfo.timeoutTimestamp)
          .multiply(1000000000)
          .toString(),
        revisionNumber: 0,
        revisionHeight: 0,
      };

      const { signDirect } = createTxIBCMsgTransfer(
        { chainId: chainIdNumber, cosmosChainId: subnetwork.chainId },
        senderInfo,
        fee,
        `sender - ${senderInfo.accountAddress}; receiver - ${params.receiver}`,
        params
      );

      return submit({
        wallet,
        signDirect,
        chainId: subnetwork.chainId,
        rpc: subnetwork.rpc,
        accountNumber: senderInfo.accountNumber,
        signer: senderInfo.accountAddress,
      });
    } catch (error) {
      console.log('error in transferring ibc: ', error);
      throw error;
    }
  }

  static async convertIbcTransferERC20({
    sender,
    gasAmount,
    gasLimits = { exec: 2400000 },
    amount,
    ibcInfo,
  }: {
    sender: string;
    gasAmount: { amount: string; denom: string };
    gasLimits?: { exec: number };
    amount: string;
    ibcInfo: {
      sourcePort: string;
      sourceChannel: string;
      amount: string;
      denom: string;
      sender: string;
      receiver: string;
      timeoutTimestamp: number;
    };
  }) {
    try {
      const subnetwork = kawaiiTokens[0];
      const chainIdNumber = parseChainIdNumber(subnetwork.chainId);

      const { wallet, accounts } = await getWallet(subnetwork.chainId);

      const fee = { ...gasAmount, gas: gasLimits.exec.toString() };

      let senderInfo = await getSenderInfo(sender, accounts[0].pubkey);

      const params = {
        ...ibcInfo,
        contractAddress: KAWAII_CONTRACT,
        destinationAddress: sender, // we want to convert erc20 token from eth address to native token with native address => use native sender address
        amount,
        timeoutTimestamp: Long.fromNumber(ibcInfo.timeoutTimestamp)
          .multiply(1000000000)
          .toString(),
        revisionNumber: 0,
        revisionHeight: 0,
      };

      const { address_eth } = await (
        await axios.get(
          `${KAWAII_API_DEV}/mintscan/v1/account/cosmos-to-eth/${senderInfo.accountAddress}`
        )
      ).data;

      const { signDirect } = createMessageConvertIbcTransferERC20(
        { chainId: chainIdNumber, cosmosChainId: subnetwork.chainId },
        senderInfo,
        address_eth,
        fee,
        `sender - ${address_eth}; receiver - ${params.receiver}`,
        params
      );

      return submit({
        wallet,
        signDirect,
        chainId: subnetwork.chainId,
        rpc: subnetwork.rpc,
        accountNumber: senderInfo.accountNumber,
        signer: sender,
      });
    } catch (error) {
      console.log('error in converting ibc transfer ERC20: ', error);
      throw error;
    }
  }
}
