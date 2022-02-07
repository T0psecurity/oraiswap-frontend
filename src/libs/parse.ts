import BigNumber from 'bignumber.js';
import numeral from 'numeral';
import { ORAI, UAIRI, AIRI } from 'constants/constants';
import { tokenInfos } from 'rest/usePairs';
import { placeholder } from 'forms/formHelpers';

type Formatter = (
  amount?: string,
  symbol?: string,
  config?: FormatConfig
) => string;

const rm = BigNumber.ROUND_DOWN;
export const dp = (contract_addr?: string) => {
  if (contract_addr) {
    const tokenInfo = findTokenInfoBySymbolOrContractAddr(contract_addr);
    return tokenInfo?.decimals || 6;
  }
  return 6;
};
export const validateDp = (
  value: string | number,
  contract_addr?: string | number
) =>
  new BigNumber(value)
    .times(
      new BigNumber(10).pow(
        typeof contract_addr === 'number' ? contract_addr : dp(contract_addr)
      )
    )
    .isInteger();

export const decimal = (value = '0', dp = 6) =>
  new BigNumber(value).decimalPlaces(dp, rm).toString();

export const findTokenInfoBySymbolOrContractAddr = (contract_addr?: string) => {
  return tokenInfos.get(
    Array.from(tokenInfos.entries(), ([key, value]) => ({
      key,
      value
    })).find(({ key, value }) => {
      return value?.symbol === contract_addr || key === contract_addr;
    })?.key || ''
  );
};

export const lookup: Formatter = (amount = '0', contract_addr, config) => {
  let decimals = 6;
  if (contract_addr) {
    const tokenInfo = findTokenInfoBySymbolOrContractAddr(contract_addr);
    if (tokenInfo) {
      decimals = tokenInfo.decimals;
    }
  }

  const e = Math.pow(10, decimals);

  const value = contract_addr
    ? new BigNumber(amount).div(e).dp(decimals, rm)
    : new BigNumber(amount);

  return value
    .dp(
      config?.dp ??
        (config?.integer ? 0 : value.gte(e) ? 2 : dp(contract_addr)),
      rm
    )
    .toString();
};

export const lookupSymbol = (symbol?: string) => {
  switch (symbol) {
    case UAIRI:
      return AIRI;

    default:
      return symbol;
  }
};

export const format: Formatter = (amount, contract_addr, config) => {
  const value = new BigNumber(lookup(amount, contract_addr, config));
  return value.gte(1e6)
    ? numeral(value.div(1e4).integerValue(rm).times(1e4)).format('0,0.[00]a')
    : numeral(value).format(
        config?.integer
          ? '0,0'
          : `0,0.[${placeholder(value.decimalPlaces())?.replace('0.', '')}]`
      );
};

export const formatAsset: Formatter = (amount, symbol, config) =>
  symbol ? `${format(amount, symbol, config)} ${lookupSymbol(symbol)}` : '';

export const toAmount = (value: string, contract_addr?: string) => {
  let decimals = 6;
  if (contract_addr) {
    const tokenInfo = findTokenInfoBySymbolOrContractAddr(contract_addr);
    if (tokenInfo) {
      decimals = tokenInfo.decimals;
    }
  }

  const e = Math.pow(10, decimals);
  return value ? new BigNumber(value).times(e).integerValue().toString() : '0';
};
