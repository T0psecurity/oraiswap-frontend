import { fromBase64, fromHex } from "@cosmjs/encoding";

export interface WasmData {
  // key is hex-encoded
  readonly key: string;
  // value is base64 encoded
  readonly val: string;
}

// Model is a parsed WasmData object
export interface Model {
  readonly key: Uint8Array;
  readonly val: Uint8Array;
}

export function parseWasmData({ key, val }: WasmData): Model {
  return {
    key: fromHex(key),
    val: fromBase64(val),
  };
}

/**
 * An object containing a parsed JSON document. The result of JSON.parse().
 * This doesn't provide any type safety over `any` but expresses intent in the code.
 */
export type JsonObject = any;
