<template>
  <q-card flat class="shop-card">
    <q-card-section class="q-px-sm q-py-xs">
      <div class="row justify-between items-center" @click="gotoShop">
        <div class="row items-center">
          <q-avatar size="lg" icon="img:lay2.svg" />
          <div class="q-ml-xs text-center text-subtitle">{{$t('shop.title')}}</div>
        </div>
        <q-icon size="sm" color="grey" name="chevron_right" />
      </div>
    </q-card-section>
    <q-separator />
    <q-card-section class="q-pa-sm">
      <sku-card v-if="!!sku" :sku="sku" />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, onMounted } from '@vue/composition-api';
import { useSkuOfToday, loadSkuOfToday, SKU } from '../compositions/shop/sku';
import SkuCard from '../components/SkuCard.vue';

export default defineComponent({
  name: 'DaoCard',
  components: { SkuCard },
  setup(props, { root }) {
    const sku = useSkuOfToday();

    onMounted(() => {
      void loadSkuOfToday();
    });

    const gotoShop = () => root.$router.push('shop');
    const gotoSku = (sku: SKU) =>
      root.$router.push(`shop/${sku.cid}/${sku.id}`);

    return {
      sku,
      gotoShop,
      gotoSku,
    };
  },
});
</script>

<style lang="scss" scoped>
.shop-card {
  border-radius: 5px;
}
</style>