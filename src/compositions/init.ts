/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import ABCWallet from 'abcwallet';
import PWCore, {
  Address,
  EthProvider,
  PwCollector,
  ChainID,
  CHAIN_SPECS
} from '@lay2/pw-core';
import { useConfig } from './config';
import { useAccount } from './account';

const ethProvider = new EthProvider((newAddress: Address) => {
  useAccount().address.value = newAddress;
});

export default async function init() {
  await new PWCore('https://lay2.ckb.dev').init(
    ethProvider,
    new PwCollector('https://cellapi.ckb.pw'),
    ChainID.ckb_dev,
    CHAIN_SPECS.Lay2
  );

  useAccount().address.value = PWCore.provider.address;

  const { platform, showHeader } = initProvider();
  useConfig().showHeader = showHeader;
  useConfig().platform = platform;
}

export const initProvider = () => {
  const UA = navigator.userAgent;
  if (window.ethereum.isImToken) return initImToken();
  if (UA.indexOf('ABCWallet') > 0) return initABCWallet();
  if (UA.indexOf('AlphaWallet') > 0) return initAlphaWallet();
  // MetaMask must be the last to check,
  // as other wallets often declare themselves
  // to be MetaMask for compatibility purpose
  if (window.ethereum.isMetaMask) return initMetaMask();
  return initDefault();
};

function initImToken() {
  try {
    window.imToken.callAPI('navigator.configure', {
      navigatorColor: '#34355b'
    });
  } catch (e) {
    console.log(e);
  }
  return {
    platform: 'ImToken',
    showHeader: false
  };
}

function initABCWallet() {
  void ABCWallet.webview.setTitlebar({
    title: 'Portal Wallet',
    forecolor: '#ffffff',
    bgcolor: '#34355b'
  });

  return {
    platform: 'ABCWallet',
    showHeader: false
  };
}

function initAlphaWallet() {
  return {
    platform: 'AlphaWallet',
    showHeader: true
  };
}

function initMetaMask() {
  return {
    platform: 'MetaMask',
    showHeader: true
  };
}

function initDefault() {
  return {
    platform: 'Unknown',
    showHeader: true
  };
}
