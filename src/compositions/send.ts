/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { reactive, ref, computed } from '@vue/composition-api';
import ABCWallet from 'abcwallet';
import PWCore, {
  Address,
  AddressType,
  Amount,
  EthSigner,
  SimpleBuilder
} from '@lay2/pw-core';
import { addPendingTx, TX } from './account';
import { BatchBuilder } from './batch-builder';
import { useConfig } from './config';
import { i18n } from 'src/boot/i18n';
import { useApi } from './api';
import { payOrder } from './shop/shop';
import { loadPendingCard } from './shop/order';

export class Pair {
  public address: Address | undefined;
  public amount: Amount;
  public valid: {
    address: boolean | string | undefined;
    amount: boolean | string | undefined;
  } = { address: undefined, amount: undefined };

  constructor(
    address?: Address | string,
    amount: Amount | string = Amount.ZERO
  ) {
    if (typeof address === 'string') {
      const addr = setAddress(address);
      addr instanceof Address && (this.address = addr);
    } else {
      this.address = address;
    }
    this.amount = amount instanceof Amount ? amount : new Amount(amount);
  }

  isValidPair() {
    return this.valid.address === true && this.valid.amount === true;
  }
}

// common
const fee = ref(Amount.ZERO);
export function useFee() {
  return fee;
}

const rate = ref(1000);
export function useRate() {
  return rate;
}

const note = ref('');
export function useNote() {
  return note;
}

const isBatch = ref(false);
export function useIsBatch() {
  return isBatch;
}

const building = ref(false);
export function useBuilding() {
  return building;
}

const sending = ref(false);
export function useSending() {
  return sending;
}

export function setAddress(val: string): Address {
  if (val.startsWith('ckb') || val.startsWith('ckt')) {
    return new Address(val, AddressType.ckb);
  } else if (isEthAddress(val)) {
    return new Address(val, AddressType.eth);
  } else {
    throw new Error(i18n.t('send.msg.wrongAddress').toString());
  }
}

export function setAmount(val: string): Amount {
  if (!val) val = '0';
  val = val.split(',').join('');
  if (/^\d+(\.\d+)?$/.test(val)) {
    return new Amount(val);
  } else {
    throw new Error(i18n.t('send.msg.wrongAmount').toString());
  }
}

// Send
const receivePair = reactive(new Pair());
export function useReceivePair() {
  return receivePair;
}

const sendMode = ref<'local' | 'remote'>('local');
export function useSendMode() {
  return sendMode;
}

const confirmSend = ref(false);
export function useConfirmSend() {
  return confirmSend;
}

export async function send(): Promise<string | undefined> {
  const address = receivePair.address;
  const amount = receivePair.amount;
  if (address instanceof Address && amount instanceof Amount) {
    sending.value = true;
    try {
      let txHash = '';
      if (useSendMode().value === 'remote') {
        const builder = new SimpleBuilder(address, amount, rate.value);
        const tx = await new EthSigner(
          PWCore.provider.address.addressString
        ).sign(await builder.build());
        txHash = tx.raw.toHash();
        const orderNo = await payOrder(tx);
        if (orderNo) {
          void loadPendingCard(orderNo, txHash);
        }
      } else {
        const pw = new PWCore(useConfig().node_url);
        txHash = await pw.send(address, amount, rate.value);
      }

      if (txHash) {
        addPendingTx(
          new TX(
            txHash,
            new Date().getTime(),
            PWCore.provider.address,
            address,
            amount,
            Amount.ZERO,
            'out'
          )
        );
      }

      sending.value = false;

      if (!!note.value && note.value.length) {
        try {
          await useApi().addNote(txHash, note.value);
          note.value = '';
        } catch (e) {
          console.error((e as Error).message);
        }
      }

      return txHash;
    } catch (e) {
      console.error((e as Error).message);
      sending.value = false;
    }
  }
  return undefined;
}

// send batch
const receivePairs = ref<Pair[]>([]);
export function useReceivePairs() {
  return receivePairs;
}

const batchBuilder = computed(
  () => new BatchBuilder(receivePairs.value, rate.value)
);
export function useBatchBuilder() {
  return batchBuilder;
}

export async function sendBatch() {
  sending.value = true;
  try {
    const pw = new PWCore(useConfig().node_url);
    const txHash = await pw.sendTransaction(
      batchBuilder.value,
      new EthSigner(PWCore.provider.address.addressString)
    );
    addPendingTx(
      new TX(
        txHash,
        new Date().getTime(),
        PWCore.provider.address,
        receivePairs.value[0].address as Address,
        receivePairs.value[0].amount,
        Amount.ZERO,
        'out'
      )
    );
    sending.value = false;
    return txHash;
  } catch (e) {
    console.error((e as Error).message);
    sending.value = false;
  }
  return undefined;
}

// tools

export async function scanQR() {
  let address = '';
  if (useConfig().platform === 'ImToken') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    address = (await window.imToken.callPromisifyAPI(
      'native.scanQRCode'
    )) as string;
  } else if (useConfig().platform === 'ABCWallet') {
    const { text } = (await ABCWallet.webview.invokeQRScanner()) as Record<
      string,
      string
    >;
    address = text;
  }
  console.log(`[${useConfig().platform}] scaned address:`, address);

  // check if is eth address
  const ethAddress = /0x[a-fA-F0-9]{40}/.exec(address);
  ethAddress && (address = ethAddress[0]);

  // check if is ckb address
  let ckbAddress = /ck[bt]1.+/.exec(address);
  !ckbAddress && (ckbAddress = /ck[bt]1.{42}/.exec(address));
  ckbAddress && (address = ckbAddress[0]);

  console.log('address:', address);
  return address;
}

export function isValidAddress(address: Address | undefined): boolean | string {
  if (address === undefined) {
    return 'Address must be provided';
  }
  try {
    address.valid();
    return true;
  } catch (e) {
    return (e as Error).message;
  }
}
export function isValidAmount(amount: Amount) {
  if (amount.lt(new Amount('61')))
    return i18n.t('send.msg.minAmount').toString();
  return true;
}

function isEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
