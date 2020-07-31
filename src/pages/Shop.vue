<template>
  <q-page class="column bg-accent">
    <q-toolbar v-if="showHeader" class="bg-accent text-white">
      <q-btn flat size="sm" round icon="arrow_back_ios" to="/" replace />
      <q-toolbar-title class="text-center text-subtitle1 text-bold">{{ $t('shop.title') }}</q-toolbar-title>
      <q-btn flat round icon="more_vert" class="invisible" />
    </q-toolbar>
    <div>
      <q-carousel
        class="bg-accent"
        animated
        v-model="slide"
        navigation
        autoplay
        swipeable
        infinite
        style="height: 40vw;"
      >
        <q-carousel-slide
          v-for="(banner, index) in banners"
          :name="index"
          :key="index"
          :img-src="banner.img"
          @click="goto(banner.link)"
        />
      </q-carousel>
    </div>
    <div class="col row">
      <div class="column">
        <q-tabs
          class="col"
          v-model="cateId"
          vertical
          active-bg-color="white"
          indicator-color="transparent"
        >
          <q-tab
            content-class="tab"
            v-for="cate in categories"
            :key="cate.id"
            :name="cate.id"
            :icon="`img:${cate.icon}`"
          />
        </q-tabs>
        <div class="column q-py-sm">
          <q-btn color="white" flat icon="list_alt" to="/shop/orders" />
          <q-separator spaced inset dark />
          <q-btn color="white" flat icon="account_balance_wallet" to="/" replace />
        </div>
      </div>
      <q-tab-panels class="col" vertical v-model="cateId" animated>
        <q-tab-panel
          class="position-relative"
          v-for="cate in categories"
          :key="cate.id"
          :name="cate.id"
        >
          <div class="text-h6">{{cate.name}}</div>
          <q-separator />
          <sku-card class="q-my-sm" v-for="sku in cate.skus" :key="sku.id" :sku="sku" />
          <q-inner-loading :showing="skuLoading">
            <q-spinner-facebook size="50px" color="accent" />
          </q-inner-loading>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from '@vue/composition-api';
import {
  loadCategories,
  useCategories,
  loadSkus,
} from '../compositions/shop/sku';
import SkuCard from '../components/SkuCard.vue';
import { useApi } from '../compositions/api';
import { useConfig } from '../compositions/config';

export default defineComponent({
  name: 'Shop',
  components: { SkuCard },
  setup() {
    const slide = ref(1);
    const cateId = ref(0);
    const skuLoading = ref(false);
    const banners = ref<{ img: string; link: string }[]>([]);

    watch(cateId, async (id) => {
      skuLoading.value = true;
      await loadSkus(id);
      skuLoading.value = false;
    });

    const categories = useCategories();

    onMounted(async () => {
      await loadCategories();
      cateId.value = 1;
      banners.value = await useApi().shop.loadBanners();
    });

    const goto = (url: string) => {
      alert(url);
    };

    return {
      showHeader: useConfig().showHeader,
      slide,
      banners,
      cateId,
      categories,
      skuLoading,
      goto,
    };
  },
});
</script>

<style lang="scss" scoped>
.tab {
  width: 64px !important;
  height: 64px !important;
}
</style>