import { SkuType } from './sku';
import { ref } from '@vue/composition-api';
import { useApi } from '../api';

export enum CardType {
  QRCODE,
  BARCODE,
  BOTHCODE,
  URL,
  SECRET,
  CODESECRET
}

export enum CardStatus {
  SUCCESS,
  FINISHED,
  REFUNDED,
  REFUNDING,
  EXPIRED
}

export interface Card {
  cardId: number;
  productName: string;
  description: string;
  uniqueCode: string;
  cardType: CardType;
  cardNo?: string;
  cardPwd?: string;
  linkUrl?: string;
  status: CardStatus;
  buyTime: number;
  finishedTime: number;
  expiresTime: number;
  paymentTxHash: string;
  payToken: string;
  payTokenAmount: string; // unit shannon
  officialPrice: number; // uint RMB cent
  sellPrice: number;
  icon: string;
  img: string;
}

export enum OrderStatus {
  INIT,
  CANCELLED,
  PAYING,
  PAID,
  DISPATCHED,
  DISPATCH_FAILED,
  FINISHED,
  REFUNDING,
  REFUND
}

export interface Order {
  orderId: number;
  orderNo: string;
  productId: number;
  productName: string;
  productType: SkuType;
  num: number;
  rechargeNo: string | undefined;
  rechargeAmount: number;
  orderAmount: number;
  status: OrderStatus;
  info: Card[];
}

const orders = ref<Order[]>([]);
export function useOrders() {
  return orders;
}

export async function loadOrders(size = 20, lastOrderId?: number) {
  orders.value = (await useApi().shop.loadOrders(size, lastOrderId)) || [];
}

const cards = ref<Card[]>([]);
export function useCards() {
  return cards;
}

export async function loadCards(type?: string, lastOrderId?: number) {
  let status = CardStatus.SUCCESS;
  switch (type) {
    case 'avaliable':
      status = CardStatus.SUCCESS;
      break;
    case 'used':
      status = CardStatus.FINISHED;
      break;
    case 'expired':
      status = CardStatus.EXPIRED;
      break;
    case 'service':
      status = CardStatus.REFUNDING;
      break;
    default:
      status = CardStatus.SUCCESS;
  }

  cards.value = (await useApi().shop.loadCards(status, 20, lastOrderId)) || [];
}

const showCardInfo = ref(false);
export function useShowCardinfo() {
  return showCardInfo;
}

const selectedCard = ref<Card | undefined>();
export function useSelectedCard() {
  return selectedCard;
}
