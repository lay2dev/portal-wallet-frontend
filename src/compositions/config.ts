import { reactive, computed } from '@vue/composition-api';
import { useSettings } from './settings';

const config = reactive({
  node_url: 'https://lay2.ckb.dev',
  // api_base: 'https://cellapi.ckb.pw',
  api_base: 'https://cellapitest.ckb.pw',
  explorer_base: 'https://explorer.ckb.pw/devnet',
  // dao_url: 'https://dao.ckb.pw',
  dao_url: 'https://dao-ckb-pw.vercel.app',

  socket_url: 'https://cellapitest.ckb.pw/',

  platform: '',
  showHeader: true
});

const FiatSymbols: Record<string, string> = {
  usd: '$',
  cny: '¥'
};

const fiatSymbol = computed(() => FiatSymbols[useSettings().currency]);
export function useFiatSymbol() {
  return fiatSymbol;
}

export function useConfig() {
  return config;
}
