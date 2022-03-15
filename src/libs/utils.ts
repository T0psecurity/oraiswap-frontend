//@ts-nocheck
import { is } from 'ramda';
import bech32 from 'bech32';
import { Fraction } from '@saberhq/token-utils';

/* object */
export const record = <T, V>(
  object: T,
  value: V,
  skip?: (keyof T)[]
): Record<keyof T, V> =>
  Object.keys(object).reduce(
    (acc, cur) =>
      Object.assign({}, acc, {
        [cur]: skip?.includes(cur as keyof T) ? object[cur as keyof T] : value
      }),
    {} as Record<keyof T, V>
  );

export const omitEmpty = (object: object): object =>
  Object.entries(object).reduce((acc, [key, value]) => {
    const next = is(Object, value) ? omitEmpty(value) : value;
    return Object.assign({}, acc, value && { [key]: next });
  }, {});

/* array */
export const insertIf = <T>(condition?: any, ...elements: T[]) =>
  condition ? elements : [];

/* string */
export const getLength = (text: string) => new Blob([text]).size;
export const capitalize = (text: string) =>
  text[0].toUpperCase() + text.slice(1);

export function getMobileOperatingSystem() {
  const userAgent = navigator.userAgent || navigator.vendor;

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return 'Windows Phone';
  }

  if (/android/i.test(userAgent)) {
    return 'Android';
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'iOS';
  }

  return 'unknown';
}

export const isMobile =
  getMobileOperatingSystem() === 'iOS' ||
  getMobileOperatingSystem() === 'Android';

const rules = [
  // if it says it's a webview, let's go with that
  'WebView',
  // iOS webview will be the same as safari but missing "Safari"
  '(iPhone|iPod|iPad)(?!.*Safari)',
  // Android Lollipop and Above: webview will be the same as native but it will contain "wv"
  // Android KitKat to lollipop webview will put {version}.0.0.0
  'Android.*(wv|.0.0.0)',
  // old chrome android webview agent
  'Linux; U; Android'
];

const webviewRegExp = new RegExp('(' + rules.join('|') + ')', 'ig');

export const isWebview = () => {
  const userAgent = navigator.userAgent || navigator.vendor;

  return !!userAgent.match(webviewRegExp);
};

export const checkPrefixAndLength = (
  prefix: string,
  data: string,
  length: number
): boolean => {
  try {
    const vals = bech32.decode(data);
    return vals.prefix === prefix && data.length == length;
  } catch (e) {
    return false;
  }
};

export const parseAmount = (value: string, decimal: number) => {
  if (!value) return '0';
  return `${(parseFloat(value) * Math.pow(10, decimal)).toFixed(0)}`;
};

export const parseDisplayAmount = (value: string, decimal: number) => {
  if (value) return `${(parseFloat(value) / Math.pow(10, decimal)).toFixed(6)}`;
  return 0;
};

window.Fraction = Fraction;

export const getUsd = (
  amount: number,
  price: Fraction | null,
  decimals: number
) => {
  if (!amount) return 0;
  if (!price) return 0;

  return price.divide(10 ** decimals / amount).asNumber;
  // return price.multiply(amount).divide(10 ** decimals).asNumber;
};
