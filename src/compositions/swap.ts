/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { reactive, ref, computed } from '@vue/composition-api';
import { useApi } from './api';
import { useAccount } from './account';
import { toWei, fromWei } from 'ethjs-unit';
import USDT_ABI from 'src/assets/usdt.json';
import PWCore, { Amount, Address } from '@lay2/pw-core';
import { useConfig } from './config';

export interface SwapItem {
  symbol: string;
  icon: string;
  address: string;
  decimal: number;
  price: number;
  balance?: string;
  min?: number;
}

export interface SwapConfig {
  chain: string;
  feeRate: number;
  depositEthAddress: string;
  tokenList: [];
}

const config = ref<SwapConfig>();
export async function loadSwapConfig() {
  config.value = await useApi().loadSwapConfig();
}

const lefts = computed(() => {
  const tokens: SwapItem[] = [];
  if (config.value?.tokenList.length) {
    for (const token of config.value.tokenList as SwapItem[]) {
      tokens.push({
        symbol: token.symbol,
        icon: `img:${token.symbol.toLowerCase()}.svg`,
        address: token.address,
        decimal: token.decimal,
        price: 0,
        balance: '0',
        min: token.min
      });
    }
  } else {
    tokens.push({
      symbol: 'ETH',
      address: '',
      icon: 'img:eth.svg',
      price: 0,
      decimal: 18
    });
  }
  return reactive(tokens);
});

const ckb = reactive({
  symbol: 'CKB',
  icon: 'img:ckb.svg',
  price: 0,
  balance: '0'
});
const rights = [ckb];

export function useSwap() {
  return { lefts, rights };
}

const fiatRates = reactive<Record<string, number>>({
  cny: 0,
  usd: 0
});

export function useFiatRates() {
  return fiatRates;
}

export interface SwapRates {
  marketPrices: [];
  otcUSDTPrices: Record<string, number>;
}

export async function loadSwapRates(data?: string) {
  const { marketPrices: rates, otcUSDTPrices: otcRates } = data
    ? JSON.parse(data)
    : await useApi().loadSwapRates();
  if (rates && lefts.value) {
    for (let i = 0; i < lefts.value.length; i++) {
      lefts.value[i].price =
        Number(
          (rates as Record<string, string>[]).find(
            r => r.symbol === lefts.value[i].symbol
          )?.price
        ) || 0;
    }
    for (let i = 0; i < rights.length; i++) {
      rights[i].price =
        Number(
          (rates as Record<string, string>[]).find(
            r => r.symbol === rights[i].symbol
          )?.price
        ) || 0;
    }
  }

  if (otcRates) {
    fiatRates.cny = otcRates.CNY;
    fiatRates.usd = otcRates.USD;
  }
}

const swapBalancesLoading = ref(false);
export function useSwapBalancesLoading() {
  return swapBalancesLoading;
}

export async function loadSwapBalances(address: Address) {
  swapBalancesLoading.value = true;
  const promises: Promise<string>[] = [];
  for (const left of lefts.value) {
    promises.push(getBalance(address.addressString, left.address));
  }
  try {
    const balances = await Promise.all(promises);
    for (let i = 0; i < balances.length; i++) {
      lefts.value[i].balance = new Amount(
        fromWei(balances[i], DecimalMap[lefts.value[i].decimal])
      ).toString(undefined, { commify: true, fixed: 6 });
    }
  } catch (e) {
    console.error((e as Error).message);
  }
  swapBalancesLoading.value = false;
}

export async function swap(
  left: SwapItem,
  leftAmount: string,
  rightAmount: string
) {
  if (config.value) {
    const txHash = await sendAssets(
      PWCore.provider.address.addressString,
      config.value.depositEthAddress,
      leftAmount,
      left.address,
      left.decimal
    );

    const ret = await useApi().submitPendingSwap(
      txHash,
      rightAmount,
      left.symbol,
      leftAmount,
      PWCore.provider.address.addressString
    );
    console.log('[SwapCard] tx sent: ', txHash, ret);
  }
}

export enum SwapTxStatus {
  CONFIRMING = 1,
  CONFIRMED,
  DELIVERING,
  DELIVERED,
  IGNORED
}

export class SwapTX {
  constructor(
    public id: number,
    public fromAmount: string,
    public fromDecimal: number,
    public fromHash: string,
    public fromSymbol: string,
    public toAmount: string,
    public toDecimal: number,
    public toHash: string,
    public toSymbol: string,
    public time: number,
    public status: SwapTxStatus
  ) {}

  getUrl() {
    return `${useConfig().explorer_base}/transaction/${this.toHash}`;
  }

  getDateTimeString(part?: string) {
    switch (part) {
      case 'date':
        return new Date(this.time).toLocaleDateString();
        break;
      case 'time':
        return new Date(this.time).toLocaleTimeString();
        break;
      default:
        return new Date(this.time).toLocaleString();
        break;
    }
  }
}

const swapTxsLoading = ref(false);

const swapTxs = ref<SwapTX[]>([]);
export function useSwapTxs() {
  return { swapTxs, swapTxsLoading };
}

const hasMoreSwapTxs = ref(true);
export function useHasMoreSwapTxs() {
  return hasMoreSwapTxs;
}

const size = 20;

export async function loadSwapTxs(lastId?: number) {
  const address = useAccount().address.value?.addressString;
  if (address) {
    swapTxsLoading.value = true;
    const rawTxs = await useApi().loadSwapTxs(address, size, lastId);
    hasMoreSwapTxs.value = rawTxs.length >= size;
    swapTxs.value = !lastId ? rawTxs : [...swapTxs.value, ...rawTxs];
    swapTxsLoading.value = false;
  }
}

// eth tools

const sendAsync = async (
  params: Array<unknown>,
  method: string
  // from: string
) =>
  new Promise<string>((resolve, reject) => {
    window.web3.currentProvider.sendAsync({ method, params }, function(
      err: Error,
      result: Record<string, string>
    ) {
      err && reject(err);
      result.error && reject(result.error);
      resolve(result.result);
    });
  });

const DecimalMap: Record<number, string> = {
  6: 'mwei',
  18: 'ether'
};

export const displayFromAmount = (amount: string, decimal: number) => {
  return new Amount(fromWei(amount, DecimalMap[decimal])).toString(undefined, {
    commify: true,
    fixed: 6
  });
};

export const sendAssets = async (
  fromAddress: string,
  toAddress: string,
  amount: number | string,
  tokenAddress: string,
  decimal = 18
) => {
  const params = [{ from: fromAddress, to: toAddress, data: '', value: '0x0' }];
  const method = 'eth_sendTransaction';
  if (tokenAddress?.length) {
    const contract = await window.web3.eth.contract(USDT_ABI).at(tokenAddress);
    amount =
      '0x' +
      BigInt(
        toWei(Number(amount).toFixed(decimal), DecimalMap[decimal])
      ).toString(16);
    console.log('[sendAssets] amount', amount);
    params[0].to = tokenAddress;
    params[0].data = contract.transfer.getData(toAddress, amount, {
      from: fromAddress
    });
  } else {
    params[0].value =
      '0x' + Number(toWei(`${amount}`, DecimalMap[decimal])).toString(16);
  }

  console.log('[sendAssets]', params[0]);
  return sendAsync(params, method);
};

export const getBalance = async (fromAddress: string, tokenAddress: string) => {
  let params = [],
    method = '';
  const from = fromAddress;
  if (tokenAddress?.length) {
    const funcSelector: string = window.web3
      .sha3('balanceOf(address)')
      .slice(0, 10);
    const data = `${funcSelector}000000000000000000000000` + from.slice(2);
    params = [{ to: tokenAddress, data }, 'latest'];
    method = 'eth_call';
  } else {
    params = [from, 'latest'];
    method = 'eth_getBalance';
  }

  return sendAsync(params, method);
};
