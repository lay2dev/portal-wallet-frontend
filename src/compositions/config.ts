import { computed } from '@vue/composition-api';
import { useSettings } from './settings';
import { LocalStorage } from 'quasar';
import { logout } from './account';

interface Urls {
  node_url: string;
  api_base: string;
  explorer_base: string;
  dao_url: string;
  socket_url: string;
}
interface Config extends Urls {
  platform: string;
  showHeader: boolean;
}

const urls: Record<string, Urls> = {
  main: {
    node_url: 'https://lina.ckb.dev',
    api_base: 'https://cellapiprod.ckb.pw',
    explorer_base: 'https://explorer.nervos.org',
    dao_url: 'https://dao.ckb.pw',
    socket_url: 'https://cellapiprod.ckb.pw/'
  },
  test: {
    node_url: 'https://lay2.ckb.dev',
    api_base: 'https://cellapitest.ckb.pw',
    explorer_base: 'https://explorer.ckb.pw/devnet',
    dao_url: 'https://dao-ckb-pw.vercel.app',
    socket_url: 'https://cellapitest.ckb.pw/'
  },
  lay2: {
    node_url: 'https://lay2.ckb.dev',
    api_base: 'https://cellapitest.ckb.pw',
    explorer_base: 'https://explorer.ckb.pw/devnet',
    dao_url: 'https://dao-ckb-pw.vercel.app',
    socket_url: 'https://cellapitest.ckb.pw/'
  }
};

let config: Config = {
  ...urls.main,
  platform: '',
  showHeader: true
};

const FiatSymbols: Record<string, string> = {
  usd: '$',
  cny: '¥'
};

const fiatSymbol = computed(() => FiatSymbols[useSettings().currency]);
export function useFiatSymbol() {
  return fiatSymbol;
}

export function loadConfig() {
  const network = LocalStorage.getItem<string>('network') || 'main';
  config = { ...urls[network], platform: '', showHeader: true };
}

export function switchNetwork(network: string) {
  logout();
  LocalStorage.set('network', network);
  window.location.reload();
}

export function useConfig() {
  return config;
}
