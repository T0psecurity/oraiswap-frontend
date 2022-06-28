import { sha256 } from '@cosmjs/crypto';
import { fromBase64, fromHex, toHex } from '@cosmjs/encoding';
import {
  AuthExtension,
  BroadcastMode,
  Coin,
  IndexedTx,
  LcdClient,
  logs,
  normalizePubkey,
  PubKey,
  setupAuthExtension,
  StdTx,
  uint64ToNumber,
  WrappedStdTx
} from '@cosmjs/launchpad';
import { Uint53 } from '@cosmjs/math';

import { setupWasmExtension, WasmExtension } from './lcdapi/wasm';
import { JsonObject } from './types';

export interface GetSequenceResult {
  readonly accountNumber: number;
  readonly sequence: number;
}

export interface Account {
  /** Bech32 account address */
  readonly address: string;
  readonly balance: readonly Coin[];
  readonly pubkey: PubKey | undefined;
  readonly accountNumber: number;
  readonly sequence: number;
}

export interface SearchByIdQuery {
  readonly id: string;
}

export interface SearchByHeightQuery {
  readonly height: number;
}

export interface SearchBySentFromOrToQuery {
  readonly sentFromOrTo: string;
}

/**
 * This query type allows you to pass arbitrary key/value pairs to the backend. It is
 * more powerful and slightly lower level than the other search options.
 */
export interface SearchByTagsQuery {
  readonly tags: ReadonlyArray<{
    readonly key: string;
    readonly value: string;
  }>;
}

export type SearchTxQuery =
  | SearchByHeightQuery
  | SearchBySentFromOrToQuery
  | SearchByTagsQuery;

function isSearchByHeightQuery(
  query: SearchTxQuery
): query is SearchByHeightQuery {
  return (query as SearchByHeightQuery).height !== undefined;
}

function isSearchBySentFromOrToQuery(
  query: SearchTxQuery
): query is SearchBySentFromOrToQuery {
  return (query as SearchBySentFromOrToQuery).sentFromOrTo !== undefined;
}

function isSearchByTagsQuery(query: SearchTxQuery): query is SearchByTagsQuery {
  return (query as SearchByTagsQuery).tags !== undefined;
}

export interface SearchTxFilter {
  readonly minHeight?: number;
  readonly maxHeight?: number;
}

export interface Code {
  readonly id: number;
  /** Bech32 account address */
  readonly creator: string;
  /** Hex-encoded sha256 hash of the code stored here */
  readonly checksum: string;
  /**
   * An URL to a .tar.gz archive of the source code of the contract, which can be used to reproducibly build the Wasm bytecode.
   *
   * @see https://github.com/CosmWasm/cosmwasm-verify
   */
  readonly source?: string;
  /**
   * A docker image (including version) to reproducibly build the Wasm bytecode from the source code.
   *
   * @example ```cosmwasm/rust-optimizer:0.8.0```
   * @see https://github.com/CosmWasm/cosmwasm-verify
   */
  readonly builder?: string;
}

export interface CodeDetails extends Code {
  /** The original wasm bytes */
  readonly data: Uint8Array;
}

export interface Contract {
  readonly address: string;
  readonly codeId: number;
  /** Bech32 account address */
  readonly creator: string;
  /** Bech32-encoded admin address */
  readonly admin: string | undefined;
  readonly label: string;
}

export interface ContractCodeHistoryEntry {
  /** The source of this history entry */
  readonly operation: 'Genesis' | 'Init' | 'Migrate';
  readonly codeId: number;
  readonly msg: Record<string, unknown>;
}

export interface BlockHeader {
  readonly version: {
    readonly block: string;
    readonly app: string;
  };
  readonly height: number;
  readonly chainId: string;
  /** An RFC 3339 time string like e.g. '2020-02-15T10:39:10.4696305Z' */
  readonly time: string;
}

export interface Block {
  /** The ID is a hash of the block header (uppercase hex) */
  readonly id: string;
  readonly header: BlockHeader;
  /** Array of raw transactions */
  readonly txs: readonly Uint8Array[];
}

/** Use for testing only */
export interface PrivateCosmWasmClient {
  readonly lcdClient: LcdClient & AuthExtension & WasmExtension;
}

export class CosmWasmClient {
  protected readonly lcdClient: LcdClient & AuthExtension & WasmExtension;
  /** Any address the chain considers valid (valid bech32 with proper prefix) */
  protected anyValidAddress: string | undefined;

  private readonly codesCache = new Map<number, CodeDetails>();
  private chainId: string | undefined;

  /**
   * Creates a new client to interact with a CosmWasm blockchain.
   *
   * This instance does a lot of caching. In order to benefit from that you should try to use one instance
   * for the lifetime of your application. When switching backends, a new instance must be created.
   *
   * @param apiUrl The URL of a Cosmos SDK light client daemon API (sometimes called REST server or REST API)
   * @param broadcastMode Defines at which point of the transaction processing the broadcastTx method returns
   */
  public constructor(apiUrl: string, broadcastMode = BroadcastMode.Block) {
    this.lcdClient = LcdClient.withExtensions(
      { apiUrl: apiUrl, broadcastMode: broadcastMode },
      setupAuthExtension,
      setupWasmExtension
    );
  }

  public async getChainId(): Promise<string> {
    if (!this.chainId) {
      const response = await this.lcdClient.nodeInfo();
      const chainId = response.node_info.network;
      if (!chainId) throw new Error('Chain ID must not be empty');
      this.chainId = chainId;
    }

    return this.chainId;
  }

  public async getHeight(): Promise<number> {
    if (this.anyValidAddress) {
      const { height } = await this.lcdClient.auth.account(
        this.anyValidAddress
      );
      return parseInt(height, 10);
    } else {
      // Note: this gets inefficient when blocks contain a lot of transactions since it
      // requires downloading and deserializing all transactions in the block.
      const latest = await this.lcdClient.blocksLatest();
      return parseInt(latest.block.header.height, 10);
    }
  }

  /**
   * Returns a 32 byte upper-case hex transaction hash (typically used as the transaction ID)
   */
  public async getIdentifier(tx: WrappedStdTx): Promise<string> {
    // We consult the REST API because we don't have a local amino encoder
    const response = await this.lcdClient.encodeTx(tx);
    const hash = sha256(fromBase64(response.tx));
    return toHex(hash).toUpperCase();
  }

  /**
   * Returns account number and sequence.
   *
   * Throws if the account does not exist on chain.
   *
   * @param address returns data for this address. When unset, the client's sender adddress is used.
   */
  public async getSequence(address: string): Promise<GetSequenceResult> {
    const account = await this.getAccount(address);
    if (!account) {
      throw new Error(
        'Account does not exist on chain. Send some tokens there before trying to query sequence.'
      );
    }
    return {
      accountNumber: account.accountNumber,
      sequence: account.sequence
    };
  }

  public async getAccount(address: string): Promise<Account | undefined> {
    // const account = await this.lcdClient.auth.account(address);
    const account = await this.lcdClient.get(`/auth/accounts/${address}`);
    const value = account.result.value;
    if (value.address === '') {
      return undefined;
    } else {
      this.anyValidAddress = value.address;
      return {
        address: value.address,
        balance: value.coins,
        pubkey: normalizePubkey(value.public_key) || undefined,
        accountNumber: uint64ToNumber(value.account_number),
        sequence: uint64ToNumber(value.sequence)
      };
    }
  }

  /**
   * Gets block header and meta
   *
   * @param height The height of the block. If undefined, the latest height is used.
   */
  public async getBlock(height?: number): Promise<Block> {
    const response =
      height !== undefined
        ? await this.lcdClient.blocks(height)
        : await this.lcdClient.blocksLatest();

    return {
      id: response.block_id.hash,
      header: {
        version: response.block.header.version,
        time: response.block.header.time,
        height: parseInt(response.block.header.height, 10),
        chainId: response.block.header.chain_id
      },
      txs: (response.block.data.txs || []).map(fromBase64)
    };
  }

  public async getTx(id: string): Promise<IndexedTx | null> {
    const results = await this.txsQuery(`tx.hash=${id}`);
    return results[0] ?? null;
  }

  public async searchTx(
    query: SearchTxQuery,
    filter: SearchTxFilter = {}
  ): Promise<readonly IndexedTx[]> {
    const minHeight = filter.minHeight || 0;
    const maxHeight = filter.maxHeight || Number.MAX_SAFE_INTEGER;

    if (maxHeight < minHeight) return []; // optional optimization

    function withFilters(originalQuery: string): string {
      return `${originalQuery}&tx.minheight=${minHeight}&tx.maxheight=${maxHeight}`;
    }

    let txs: readonly IndexedTx[];
    if (isSearchByHeightQuery(query)) {
      // optional optimization to avoid network request
      if (query.height < minHeight || query.height > maxHeight) {
        txs = [];
      } else {
        txs = await this.txsQuery(`tx.height=${query.height}`);
      }
    } else if (isSearchBySentFromOrToQuery(query)) {
      // We cannot get both in one request (see https://github.com/cosmos/gaia/issues/75)
      const sentQuery = withFilters(
        `message.module=bank&message.sender=${query.sentFromOrTo}`
      );
      const receivedQuery = withFilters(
        `message.module=bank&transfer.recipient=${query.sentFromOrTo}`
      );
      const [sent, received] = (await Promise.all([
        this.txsQuery(sentQuery),
        this.txsQuery(receivedQuery)
      ])) as [IndexedTx[], IndexedTx[]];

      let mergedTxs: readonly IndexedTx[] = [];
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      // sent/received are presorted
      while (sent.length && received.length) {
        const next =
          sent[0].hash === received[0].hash
            ? sent.shift()! && received.shift()!
            : sent[0].height <= received[0].height
            ? sent.shift()!
            : received.shift()!;
        mergedTxs = [...mergedTxs, next];
      }
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
      // At least one of sent/received is empty by now
      txs = [...mergedTxs, ...sent, ...received];
    } else if (isSearchByTagsQuery(query)) {
      const rawQuery = withFilters(
        query.tags.map((t) => `${t.key}=${t.value}`).join('&')
      );
      txs = await this.txsQuery(rawQuery);
    } else {
      throw new Error('Unknown query type');
    }

    // backend sometimes messes up with min/max height filtering
    const filtered = txs.filter(
      (tx) => tx.height >= minHeight && tx.height <= maxHeight
    );

    return filtered;
  }

  public async broadcastTx(tx: StdTx): Promise<any> {
    const result = await this.lcdClient.broadcastTx(tx);
    if (!result.txhash.match(/^([0-9A-F][0-9A-F])+$/)) {
      throw new Error(
        'Received ill-formatted txhash. Must be non-empty upper-case hex'
      );
    }

    return result.code !== undefined
      ? {
          height: Uint53.fromString(result.height).toNumber(),
          transactionHash: result.txhash,
          code: result.code,
          rawLog: result.raw_log || ''
        }
      : {
          logs: result.logs ?? [],
          rawLog: result.raw_log || '',
          transactionHash: result.txhash,
          data: result.data ? fromHex(result.data) : undefined
        };
  }

  public async getCodes(): Promise<readonly Code[]> {
    const result = await this.lcdClient.wasm.listCodeInfo();
    return result.map((entry): Code => {
      this.anyValidAddress = entry.creator;
      return {
        id: entry.id,
        creator: entry.creator,
        checksum: toHex(fromHex(entry.data_hash)),
        source: entry.source || undefined,
        builder: entry.builder || undefined
      };
    });
  }

  public async getCodeDetails(codeId: number): Promise<CodeDetails> {
    const cached = this.codesCache.get(codeId);
    if (cached) return cached;

    const getCodeResult = await this.lcdClient.wasm.getCode(codeId);
    const codeDetails: CodeDetails = {
      id: getCodeResult.id,
      creator: getCodeResult.creator,
      checksum: toHex(fromHex(getCodeResult.data_hash)),
      source: getCodeResult.source || undefined,
      builder: getCodeResult.builder || undefined,
      data: fromBase64(getCodeResult.data)
    };
    this.codesCache.set(codeId, codeDetails);
    return codeDetails;
  }

  public async getContracts(codeId: number): Promise<readonly Contract[]> {
    const result = await this.lcdClient.wasm.listContractsByCodeId(codeId);
    return result.map(
      (entry): Contract => ({
        address: entry.address,
        codeId: entry.code_id,
        creator: entry.creator,
        admin: entry.admin,
        label: entry.label
      })
    );
  }

  /**
   * Throws an error if no contract was found at the address
   */
  public async getContract(address: string): Promise<Contract> {
    const result = await this.lcdClient.wasm.getContractInfo(address);
    if (!result) throw new Error(`No contract found at address "${address}"`);
    return {
      address: result.address,
      codeId: result.code_id,
      creator: result.creator,
      admin: result.admin,
      label: result.label
    };
  }

  /**
   * Throws an error if no contract was found at the address
   */
  public async getContractCodeHistory(
    address: string
  ): Promise<readonly ContractCodeHistoryEntry[]> {
    const result = await this.lcdClient.wasm.getContractCodeHistory(address);
    if (!result)
      throw new Error(`No contract history found for address "${address}"`);
    return result.map(
      (entry): ContractCodeHistoryEntry => ({
        operation: entry.operation,
        codeId: entry.code_id,
        msg: entry.msg
      })
    );
  }

  /**
   * Returns the data at the key if present (raw contract dependent storage data)
   * or null if no data at this key.
   *
   * Promise is rejected when contract does not exist.
   */
  public async queryContractRaw(
    address: string,
    key: Uint8Array
  ): Promise<Uint8Array | null> {
    // just test contract existence
    const _info = await this.getContract(address);

    return this.lcdClient.wasm.queryContractRaw(address, key);
  }

  /**
   * Makes a smart query on the contract, returns the parsed JSON document.
   *
   * Promise is rejected when contract does not exist.
   * Promise is rejected for invalid query format.
   * Promise is rejected for invalid response format.
   */
  public async queryContractSmart(
    address: string,
    queryMsg: Record<string, unknown>
  ): Promise<JsonObject> {
    try {
      return await this.lcdClient.wasm.queryContractSmart(address, queryMsg);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.startsWith('not found: contract')) {
          throw new Error(`No contract found at address "${address}"`);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  private async txsQuery(query: string): Promise<readonly IndexedTx[]> {
    // TODO: we need proper pagination support
    const limit = 100;
    const result = await this.lcdClient.txsQuery(`${query}&limit=${limit}`);
    const pages = parseInt(result.page_total, 10);
    if (pages > 1) {
      throw new Error(
        `Found more results on the backend than we can process currently. Results: ${result.total_count}, supported: ${limit}`
      );
    }
    return result.txs.map(
      (restItem): IndexedTx => ({
        height: parseInt(restItem.height, 10),
        hash: restItem.txhash,
        code: restItem.code || 0,
        rawLog: restItem.raw_log,
        logs: logs.parseLogs(restItem.logs || []),
        tx: restItem.tx,
        timestamp: restItem.timestamp
      })
    );
  }
}
