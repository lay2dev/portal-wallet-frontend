<template>
  <q-card class="sku-card" flat>
    <q-card-section class="q-pa-sm">
      <div class="row q-gutter-md">
        <q-img contain width="90px" :src="sku.img" :ratio="8/5" spinner-color="primary" />
        <div class="column justify-between">
          <div class="text-subtitle">{{ sku.name }}</div>
          <div class="text-caption text-grey text-strike">¥ {{ sku.officialPrice / 100 }}</div>
          <div class="text-subtitle text-negative">¥ {{ sku.sellPrice / 100 }}</div>
        </div>
      </div>
      <q-btn
        class="absolute-bottom-right q-ma-sm"
        unelevated
        size="sm"
        color="warning"
        icon="shopping_cart"
        :to="`shop/order/${sku.cid}/${sku.id}`"
      />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api';
import { SKU } from '../compositions/shop/sku';

export default defineComponent({
  name: 'SkuCard',
  props: {
    sku: {
      type: (Object as unknown) as PropType<SKU>,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
.sku-card {
  background-color: $indigo-1;
  border-radius: 5px;
}
</style>