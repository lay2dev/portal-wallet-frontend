import { SKU } from './sku';
import { ref } from '@vue/composition-api';
import { useApi } from '../api';
import { LocalStorage } from 'quasar';

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
  INIT = 1,
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
  product: SKU;
  payTime: number;
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

export async function loadPendingCard(orderNo: string, txHash: string) {
  if (!!orderNo) {
    const order = await useApi().shop.loadOrder(orderNo);
    console.log('[order.ts] pending order: ', order);
    if (order?.status === OrderStatus.PAYING) {
      const card: Card = {
        productName: order.product.name,
        sellPrice: order.product.sellPrice,
        img: order.product.img,
        paymentTxHash: txHash,
        expiresTime: new Date().getTime() + 600 * 1000
      } as Card;
      const pendingCards =
        (LocalStorage.getItem('pendingCards') as Card[]) || [];
      pendingCards.unshift(card);
      LocalStorage.set('pendingCards', pendingCards);
    }
  }
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

  const res = await useApi().shop.loadCards(status, 20, lastOrderId);
  const threshold = res?.length > 5 ? 5 : res?.length;
  const pendingCards = (LocalStorage.getItem('pendingCards') as Card[]) || [];

  for (let i = 0; i < pendingCards.length; i++) {
    if (pendingCards[i].expiresTime < new Date().getTime()) {
      pendingCards.splice(i);
    } else {
      for (let j = 0; j < threshold; j++) {
        if (res[j].paymentTxHash === pendingCards[i].paymentTxHash) {
          pendingCards.splice(i);
          break;
        }
      }
    }
  }

  LocalStorage.set('pendingCards', pendingCards);

  cards.value = [...pendingCards, ...res];
}

const showCardInfo = ref(false);
export function useShowCardinfo() {
  return showCardInfo;
}

const selectedCard = ref<Card | undefined>();
export function useSelectedCard() {
  return selectedCard;
}
