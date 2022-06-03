import { collectWallet } from './cosmjs';
import { StargateClient } from '@cosmjs/stargate';
import { kawaiiTokens } from 'config/bridgeTokens';
import { KAWAII_API_DEV, KAWAII_CONTRACT, KAWAII_LCD } from 'config/constants';
import { createMessageConvertCoin, createMessageConvertERC20 } from '@oraichain/kawaiiversejs';
import Long from 'long';
import { createTxRaw } from '@tharsis/proto';
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import axios from 'rest/request';

async function getAccountInfo(accAddress: string) {
  return await fetch(
    `${KAWAII_LCD}/cosmos/auth/v1beta1/accounts/${accAddress}`,
    { method: 'GET' }
  ).then(data => data.json());
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
  }
}

async function submit({
  wallet,
  signDirect,
  chainId,
  rpc,
  accountNumber,
  signer,
}: { wallet: OfflineDirectSigner, signDirect: any, chainId: string, rpc: string, accountNumber: number, signer: string }) {
  const bodyBytes = signDirect.body.serialize();
  const authInfoBytes = signDirect.authInfo.serialize();
  const signResult = await wallet.signDirect(signer, { bodyBytes, authInfoBytes, chainId, accountNumber: new Long(accountNumber) });
  const signature = Buffer.from(signResult.signature.signature, "base64");
  const txRaw = createTxRaw(signResult.signed.bodyBytes, signResult.signed.authInfoBytes, [signature]).message.serialize();
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
    coin: { amount: string, denom: string }
  }) {
    try {

      const subnetwork = kawaiiTokens[0];
      const chainIdNumber = parseChainIdNumber(subnetwork.chainId);

      if (await window.Keplr.getKeplr())
        await window.Keplr.suggestChain(subnetwork.chainId);

      const wallet = await collectWallet(subnetwork.chainId);
      const accounts = await wallet.getAccounts();

      const fee = {
        amount: gasAmount.amount.toString(),
        denom: gasAmount.denom.toString(),
        gas: gasLimits.exec.toString(),
      }

      const senderInfo = await getSenderInfo(sender, accounts[0].pubkey);
      const { address_eth } = await (await axios.get(`${KAWAII_API_DEV}/mintscan/v1/account/cosmos-to-eth/${senderInfo.accountAddress}`)).data;

      const params = {
        destinationAddress: address_eth,
        amount: coin.amount.toString(),
        denom: coin.denom.toString(),
      }

      const { signDirect } = createMessageConvertCoin({ chainId: chainIdNumber, cosmosChainId: subnetwork.chainId }, senderInfo, fee, '', params);

      return submit({ wallet, signDirect, chainId: subnetwork.chainId, rpc: subnetwork.rpc, accountNumber: senderInfo.accountNumber, signer: senderInfo.accountAddress });
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
    gasLimits = { exec: 2000000 },
    amount
  }: {
    sender: string;
    gasAmount: { amount: string; denom: string };
    gasLimits?: { exec: number };
    amount: string
  }) {
    try {

      const subnetwork = kawaiiTokens[0];
      const chainIdNumber = parseChainIdNumber(subnetwork.chainId);

      if (await window.Keplr.getKeplr())
        await window.Keplr.suggestChain(subnetwork.chainId);

      const wallet = await collectWallet(subnetwork.chainId);
      const accounts = await wallet.getAccounts();

      const fee = {
        amount: gasAmount.amount.toString(),
        denom: gasAmount.denom.toString(),
        gas: gasLimits.exec.toString(),
      }

      let senderInfo = await getSenderInfo(sender, accounts[0].pubkey);
      const { address_eth } = await (await axios.get(`${KAWAII_API_DEV}/mintscan/v1/account/cosmos-to-eth/${senderInfo.accountAddress}`)).data;
      senderInfo.accountAddress = address_eth;

      const params = {
        contractAddress: KAWAII_CONTRACT,
        destinationAddress: senderInfo.accountAddress, // we want to convert erc20 token from eth address to native token with native address => use native sender address
        amount,
      }

      const { signDirect } = createMessageConvertERC20({ chainId: chainIdNumber, cosmosChainId: subnetwork.chainId }, senderInfo, fee, '', params);      
      
      return submit({ wallet, signDirect, chainId: subnetwork.chainId, rpc: subnetwork.rpc, accountNumber: senderInfo.accountNumber, signer: senderInfo.accountAddress });
    } catch (error) {
      console.log('error in converting ERC20: ', error);
      throw error;
    }
  }
}
