import { ref } from '@vue/composition-api';
import { useApi } from '../api';

export enum SkuType {
  CARD,
  RECHARGE_TEL,
  RECHARGE
}

export interface CATE {
  id: number;
  name: string;
  icon: string;
  type: SkuType;
  skus: SKU[];
}

export interface SKU {
  cid: number;
  id: number;
  productType: SkuType;
  name: string;
  img: string;
  description: string;
  officialPrice: number;
  sellPrice: number;
  stock: number;
}

const categories = ref<CATE[]>([]);
export function useCategories() {
  return categories;
}

export async function loadCategories() {
  categories.value = await useApi().shop.loadCategories();
}

const skuOfToday = ref<SKU[]>([]);
export const useSkuOfToday = () => skuOfToday;

export async function loadSkuOfToday() {
  skuOfToday.value = (await useApi().shop.loadSelectedSkus()) || [];
}

export async function loadSkus(cateId: number) {
  for (let i = 0; i < categories.value.length; i++) {
    if (categories.value[i].id === cateId) {
      const skus = await useApi().shop.loadSkus(cateId);
      categories.value[i] = { ...categories.value[i], skus };
      break;
    }
  }
}
