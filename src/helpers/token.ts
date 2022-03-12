import Token from 'images/Token/Token.svg';
import { tokenInfos } from 'rest/usePairs';

import { ORAI, UAIRI, AIRI, ATOM } from '../constants/constants';

export const getSymbol = (key: string) => {
  switch (key) {
    case AIRI:
      return UAIRI;
    case ATOM:
      return ATOM;
    case ORAI:
      return ORAI;
    default:
      return '';
  }
};

export const hasTaxToken = (contract_addr: string) => {
  if (contract_addr === ORAI || contract_addr.startsWith('orai')) {
    return false;
  }

  return true;
};

export const GetTokenSvg = (icon: string, symbol: string) => {
  if (icon && icon !== '') {
    return icon;
  }

  const denom = getSymbol(symbol);
  const tokenInfo = tokenInfos.get(denom);
  if (tokenInfo && tokenInfo.icon !== '') {
    return tokenInfo.icon;
  }

  return Token;
};
