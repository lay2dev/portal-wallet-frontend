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
    <q-card-section class="q-pa-none">
      <q-carousel height="auto" autoplay animated v-model="slide" swipeable infinite>
        <q-carousel-slide class="q-pa-none" v-for="(sku, index) in skus" :name="index" :key="index">
          <sku-card :sku="sku" class="bg-white" />
        </q-carousel-slide>
      </q-carousel>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from '@vue/composition-api';
import { useSkuOfToday, loadSkuOfToday, SKU } from '../compositions/shop/sku';
import SkuCard from '../components/SkuCard.vue';

export default defineComponent({
  name: 'DaoCard',
  components: { SkuCard },
  setup(props, { root }) {
    const skus = useSkuOfToday();
    const slide = ref(0);

    onMounted(() => {
      void loadSkuOfToday();
    });

    const gotoShop = () => root.$router.push('shop');
    const gotoSku = (sku: SKU) =>
      root.$router.push(`shop/${sku.cid}/${sku.id}`);

    return {
      skus,
      slide,
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
.custom-caption {
  text-align: center;
  background-color: rgba(0, 0, 0, 0.3);
}
</style>