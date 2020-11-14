import { Transaction } from '@lay2/pw-core';
import { ref } from '@vue/composition-api';
import { useApi } from '../api';

const orderNo = ref<string | undefined>();
export function useOrderNo() {
  return orderNo;
}

const config = ref<{ paymentList: {address: string, token: string}[]; name: string; img: string }>();
export function useShopConfig() {
  return config;
}

export async function payOrder(tx: Transaction, token: string) {
  if (!!orderNo.value) {
    await useApi().shop.payOrder(orderNo.value, tx, token);
    return orderNo.value;
  }

  return false;
}
