/* eslint-disable @typescript-eslint/naming-convention */
import { Coin, Msg } from "@cosmjs/launchpad";

// TODO: implement
/**
 * @see https://github.com/CosmWasm/wasmd/blob/v0.10.0-alpha/x/wasm/internal/types/params.go#L68-L71
 */
export type AccessConfig = never;

/**
 * Uploads Wasm code to the chain.
 * A numeric, auto-incrementing code ID will be generated as a result of the execution of this message.
 *
 * @see https://github.com/CosmWasm/wasmd/blob/v0.10.0-alpha/x/wasm/internal/types/msg.go#L10-L20
 */
export interface MsgStoreCode extends Msg {
  readonly type: "wasm/MsgStoreCode";
  readonly value: {
    /** Bech32 account address */
    readonly sender: string;
    /** Base64 encoded Wasm */
    readonly wasm_byte_code: string;
    /** A valid URI reference to the contract's source code. Can be empty. */
    readonly source: string;
    /** A docker tag. Can be empty. */
    readonly builder: string;
    readonly instantiate_permission?: AccessConfig;
  };
}

export function isMsgStoreCode(msg: Msg): msg is MsgStoreCode {
  return (msg as MsgStoreCode).type === "wasm/MsgStoreCode";
}

/**
 * Creates an instance of contract that was uploaded before.
 * This will trigger a call to the "init" export.
 *
 * @see https://github.com/CosmWasm/wasmd/blob/v0.9.0-alpha4/x/wasm/internal/types/msg.go#L104
 */
export interface MsgInstantiateContract extends Msg {
  readonly type: "wasm/MsgInstantiateContract";
  readonly value: {
    /** Bech32 account address */
    readonly sender: string;
    /** ID of the Wasm code that was uploaded before */
    readonly code_id: string;
    /** Human-readable label for this contract */
    readonly label: string;
    /** Init message as JavaScript object */
    readonly init_msg: any;
    readonly init_funds: readonly Coin[];
    /** Bech32-encoded admin address */
    readonly admin?: string;
  };
}

export function isMsgInstantiateContract(msg: Msg): msg is MsgInstantiateContract {
  return (msg as MsgInstantiateContract).type === "wasm/MsgInstantiateContract";
}

/**
 * Update the admin of a contract
 *
 * @see https://github.com/CosmWasm/wasmd/blob/v0.9.0-beta/x/wasm/internal/types/msg.go#L231
 */
export interface MsgUpdateAdmin extends Msg {
  readonly type: "wasm/MsgUpdateAdmin";
  readonly value: {
    /** Bech32-encoded sender address. This must be the old admin. */
    readonly sender: string;
    /** Bech32-encoded contract address to be updated */
    readonly contract: string;
    /** Bech32-encoded address of the new admin */
    readonly new_admin: string;
  };
}

export function isMsgUpdateAdmin(msg: Msg): msg is MsgUpdateAdmin {
  return (msg as MsgUpdateAdmin).type === "wasm/MsgUpdateAdmin";
}

/**
 * Clears the admin of a contract, making it immutable.
 *
 * @see https://github.com/CosmWasm/wasmd/blob/v0.9.0-beta/x/wasm/internal/types/msg.go#L269
 */
export interface MsgClearAdmin extends Msg {
  readonly type: "wasm/MsgClearAdmin";
  readonly value: {
    /** Bech32-encoded sender address. This must be the old admin. */
    readonly sender: string;
    /** Bech32-encoded contract address to be updated */
    readonly contract: string;
  };
}

export function isMsgClearAdmin(msg: Msg): msg is MsgClearAdmin {
  return (msg as MsgClearAdmin).type === "wasm/MsgClearAdmin";
}

/**
 * Execute a smart contract.
 * This will trigger a call to the "handle" export.
 *
 * @see https://github.com/CosmWasm/wasmd/blob/v0.9.0-alpha4/x/wasm/internal/types/msg.go#L158
 */
export interface MsgExecuteContract extends Msg {
  readonly type: "wasm/MsgExecuteContract";
  readonly value: {
    /** Bech32 account address */
    readonly sender: string;
    /** Bech32 account address */
    readonly contract: string;
    /** Handle message as JavaScript object */
    readonly msg: any;
    readonly sent_funds: readonly Coin[];
  };
}

export function isMsgExecuteContract(msg: Msg): msg is MsgExecuteContract {
  return (msg as MsgExecuteContract).type === "wasm/MsgExecuteContract";
}

/**
 * Migrates a contract to a new Wasm code.
 *
 * @see https://github.com/CosmWasm/wasmd/blob/v0.9.0-alpha4/x/wasm/internal/types/msg.go#L195
 */
export interface MsgMigrateContract extends Msg {
  readonly type: "wasm/MsgMigrateContract";
  readonly value: {
    /** Bech32 account address */
    readonly sender: string;
    /** Bech32 account address */
    readonly contract: string;
    /** The new code */
    readonly code_id: string;
    /** Migrate message as JavaScript object */
    readonly msg: any;
  };
}

export function isMsgMigrateContract(msg: Msg): msg is MsgMigrateContract {
  return (msg as MsgMigrateContract).type === "wasm/MsgMigrateContract";
}
