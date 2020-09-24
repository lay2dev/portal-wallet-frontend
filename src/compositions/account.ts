import { reactive, toRefs, ref, watch, toRef } from '@vue/composition-api';
import PWCore, {
  Amount,
  Address,
  AddressType,
  AmountUnit
} from '@lay2/pw-core';
import { useConfig } from './config';
import { useApi, checkAuthorization } from './api';
import { LocalStorage, Cookies } from 'quasar';
import { loadSwapRates, loadSwapTxs } from './swap';
import { LoginSigner } from './login-signer';
import IoClient from 'socket.io-client';
import { loadCards } from './shop/order';

const account = reactive<{
  address: Address | undefined;
  portalAddress: string | undefined;
  balance: Amount;
  loading: boolean;
}>({
  address: undefined,
  portalAddress: undefined,
  balance: Amount.ZERO,
  loading: false
});

export async function updateAccount(address: Address) {
  if (address instanceof Address) {
    account.address = address;
    account.loading = true;
    account.balance = await PWCore.defaultCollector.getBalance(address);
    account.loading = false;
  }
}

export function useAccount() {
  return toRefs(account);
}

const portalAddress = ref('');
export function usePortalAddress() {
  return portalAddress;
}

const updateData = (address: Address) => {
  void updateAccount(address);
  void loadTxRecords({ address, silent: true });
  void updateDao(address);
};

watch(toRef(account, 'address'), async address => {
  console.log('[account.ts] address updated', address?.addressString);
  if (address instanceof Address) {
    await checkLoginStatus(address.addressString);
    await Promise.all([
      updateAccount(address),
      loadAssets(address),
      // loadTxRecords({ address }),
      loadSwapRates(),
      authorized.value && loadCards(),
      updateDao(address),
      getPortalAddress(address),
      initSocket(address)
    ]);
  }
});

const getAddress = (address: string) =>
  new Address(
    address,
    address.startsWith('0x') ? AddressType.eth : AddressType.ckb
  );

const getPortalAddress = async (address: Address) => {
  account.portalAddress = await useApi().loadPortalAddress(
    address.toCKBAddress()
  );
};

const initSocket = (address: Address) => {
  const socket = ref<SocketIOClient.Socket>(
    IoClient(useConfig().socket_url, {
      transports: ['websocket']
    })
  );
  if (socket.value !== undefined) {
    socket.value.on('connect', () => {
      const type = authorized.value ? 'token' : 'address';
      const value =
        type === 'token'
          ? Cookies.get('AT+' + address.addressString)
          : address.addressString;
      socket.value.emit('login', {
        type,
        value
      });
    });

    socket.value.on('newTx', () => {
      void updateData(address);
      void loadSwapTxs();
    });

    socket.value.on('store.order.success', () => {
      void loadCards();
    });

    socket.value.on('tokenPrice', (data: string) => {
      void loadSwapRates(data);
    });

    socket.value.on(
      'loginResponse',
      (data: { success: boolean; info: string }) => {
        console.log('[socket] login response: ', data.info);
      }
    );
  }
};

// --------Assets---------
export interface Asset {
  id: string;
  symbol: string;
  icon: string;
  capacity: Amount;
  balance: Amount;
  price: number;
}

const assets = ref<Asset[]>([]);
export function useAssets() {
  return assets;
}

export async function loadAssets(address: Address) {
  assets.value = await new Promise<Asset[]>(resolve => {
    resolve([
      {
        id: '0xaasdffdsfds',
        symbol: 'CKB',
        icon: 'https://www.nervos.org//wp-content/uploads/2019/07/n.png',
        capacity: new Amount('10000000'),
        balance: new Amount('10000000'),
        price: 0.004
      }
    ]);
  });
  console.log('[account.ts] loadAssets: ', assets.value);
}

// ---------DAO-----------

const dao = reactive<{
  apc: string;
  locked: Amount;
  yesterday: Amount;
  cumulative: Amount;
}>({
  apc: '-',
  locked: Amount.ZERO,
  yesterday: Amount.ZERO,
  cumulative: Amount.ZERO
});

export async function updateDao(address: Address) {
  const res = await useApi().loadDao(address.toLockScript().toHash());
  if (res) {
    dao.apc = res.apc;
    dao.locked = res.locked;
    dao.yesterday = res.yesterday;
    dao.cumulative = res.cumulative;
  }
}

export function useDao() {
  return toRefs(dao);
}

// ---------TXS-----------

export class TX {
  constructor(
    public readonly txHash: string,
    public readonly time: number,
    public readonly from: Address,
    public readonly to: Address,
    public readonly amount: Amount,
    public readonly fee: Amount,
    public readonly direction: string,
    public readonly inputCount?: number,
    public readonly outputCount?: number,
    public readonly blockNumber?: number,
    public readonly note?: string
  ) {}

  getUrl() {
    return `${useConfig().explorer_base}/transaction/${this.txHash}`;
  }

  getDateTimeString(part?: string) {
    switch (part) {
      case 'date':
        return new Date(this.time).toLocaleDateString();
      case 'time':
        return new Date(this.time).toLocaleTimeString();
      default:
        return new Date(this.time).toLocaleString();
    }
  }
}

const txs = ref<TX[]>([]);
const txsLoading = ref(false);

const hasMoreTxs = ref(true);
export function useHasMoreTxs() {
  return hasMoreTxs;
}

interface PendingInfo {
  txHash: string;
  from: Address;
  to: Address;
  amount: string;
  time: number;
}

function loadLocalPending() {
  const pending = LocalStorage.getItem<PendingInfo[]>('pending');
  console.log('[loadLocalPending] pending: ', pending);
  if (pending) {
    const stillPending = pending.filter(
      p =>
        new Date().getTime() - p.time < 600 * 1000 &&
        txs.value.find(tx => tx.txHash === p.txHash) === undefined
    );
    LocalStorage.set('pending', stillPending);
    const stillPendingTx = stillPending.map(
      p =>
        new TX(
          p.txHash,
          p.time,
          p.from,
          p.to,
          new Amount(p.amount),
          Amount.ZERO,
          'out'
        )
    );
    console.log('[loadLocalPending] stillPendingTx', stillPendingTx);
    txs.value = [...stillPendingTx, ...txs.value];
  }
}

const txFilter = reactive({
  direction: 'all',
  size: 10
});

export function useTxFilter() {
  return txFilter;
}

export async function loadTxRecords({
  address = account.address,
  size = 0,
  direction = '',
  lastHash = '',
  silent = false
}) {
  size = size || txFilter.size;
  direction = direction.length ? direction : txFilter.direction;

  if (address !== undefined) {
    txsLoading.value = !silent && true;
    const res = await useApi().loadTxRecords(
      address.toLockScript().toHash(),
      lastHash,
      size,
      direction
    );

    const rawTxs = res.map(
      tx =>
        new TX(
          tx.hash as string,
          tx.time as number,
          getAddress(tx.from as string),
          getAddress(tx.to as string),
          new Amount(tx.amount as string, AmountUnit.shannon),
          new Amount(`${tx.fee > 0 ? tx.fee : 0}`, AmountUnit.shannon),
          tx.direction as string,
          tx.inputSize as number,
          tx.outputSize as number,
          tx.blockNumber as number,
          tx.remark as string
        )
    );

    hasMoreTxs.value = rawTxs.length >= size;

    txs.value = lastHash.length ? [...txs.value, ...rawTxs] : rawTxs;

    loadLocalPending();
    txsLoading.value = false;
  } else {
    txs.value = [];
  }
  console.log('[loadTxRecords] txs: ', txs.value);
}

export function useTxRecords() {
  return { txs, txsLoading };
}

export function addPendingTx(pending: TX) {
  txs.value = [pending, ...txs.value];
  let local = LocalStorage.getItem<PendingInfo[]>('pending');
  const pendingInfo: PendingInfo = {
    txHash: pending.txHash,
    from: pending.from,
    to: pending.to,
    amount: pending.amount.toString(AmountUnit.ckb),
    time: pending.time
  };
  if (local) {
    local.push(pendingInfo);
  } else {
    local = [pendingInfo];
  }
  LocalStorage.set('pending', local);
}

// ---------Login-----------

const showLogin = ref(false);
export function useShowLogin() {
  return showLogin;
}

const authorized = ref(false);
export function useAuthorized() {
  return authorized;
}

export async function checkLoginStatus(address: string) {
  const AT = await checkAuthorization(address);
  if (AT === undefined) {
    authorized.value = false;
  } else {
    authorized.value = true;
  }
  console.log('[login check] ', authorized.value);
}

watch(authorized, authorized => {
  void loadTxRecords({ address: account.address });
  if (authorized) {
    console.log('[account] authorized: ', authorized);
    void loadContacts();
    void loadCards();
  }
});

export function logout() {
  const address = account.address?.addressString;
  if (!!address) {
    Cookies.remove('AT+' + address);
    if (Cookies.has('AT+' + address)) {
      console.log('[logout] failed');
    } else {
      authorized.value = false;
      console.log('[logout] success');
    }
  }
}

export async function login() {
  if (account.address) {
    const signer = new LoginSigner(account.address.addressString);
    const timestamp = new Date().getTime();
    let sig = undefined;
    try {
      if (useConfig().platform === 'MetaMask') {
        sig = await signer.signLogin(timestamp);
      } else {
        sig = await signer.signLogin(timestamp, false);
      }
    } catch (e) {
      console.log('[login] cancelled');
      showLogin.value = false;
      return;
    }
    console.log('[login] signature: ', sig);

    const { accessToken, refreshToken } = await useApi().login(
      account.address.addressString,
      timestamp,
      sig
    );
    if (!!accessToken && !!refreshToken) {
      Cookies.set('AT+' + account.address.addressString, accessToken, {
        sameSite: 'Strict',
        // httpOnly: true,
        secure: true
      });
      LocalStorage.set('RT+' + account.address.addressString, refreshToken);
      console.log('[login] accessToken: ', accessToken);

      authorized.value = true;
      showLogin.value = false;
    }
  } else {
    throw new Error('Address must be aquired before login');
  }
}

// ---------Contacts-----------

export class Contact {
  constructor(
    public address: string,
    public name: string,
    public description: string,
    public id: number = 0
  ) {}
}
const contacts = ref<Contact[]>([]);

export function useContacts() {
  return contacts;
}

export async function loadContacts() {
  contacts.value = await useApi().loadContacts();
}

// ---------Tools-----------

export function truncatedAddress(address: string | undefined, length = 18) {
  if (address === undefined) return '-';
  if (address.length <= length) return address;

  const separator = length % 2 ? '...' : '..';
  const fixlen = (length - separator.length) / 2;

  return `${address.slice(0, fixlen)}...${address.slice(-fixlen)}`;
}
