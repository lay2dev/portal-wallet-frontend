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
        style="height: 200px;"
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
    <div class="row col">
      <div class="column bg-accent">
        <q-tabs v-model="cateId" vertical active-bg-color="white" indicator-color="transparent">
          <q-tab
            content-class="tab"
            v-for="cate in categories"
            :key="cate.id"
            :name="cate.id"
            :icon="`img:${cate.icon}`"
          />
          <q-separator spaced inset dark />
          <div class="column col q-py-sm">
            <q-btn color="white" flat icon="list_alt" to="/shop/orders" />
          </div>
        </q-tabs>
      </div>
      <q-tab-panels class="col" vertical v-model="cateId">
        <q-tab-panel
          class="position-relative"
          v-for="cate in categories"
          :key="cate.id"
          :name="cate.id"
        >
          <q-scroll-area :visible="false" :thumb-style="{ width: '1px', opacity: 0 }" class="fit">
            <div class="text-h6">{{cate.name}}</div>
            <q-separator />
            <div class="q-gutter-sm q-mt-sm">
              <sku-card v-for="sku in cate.skus" :key="sku.id" :sku="sku" />
            </div>
            <q-inner-loading :showing="skuLoading">
              <q-spinner-facebook size="50px" color="accent" />
            </q-inner-loading>
          </q-scroll-area>
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
import { openURL } from 'quasar';

export default defineComponent({
  name: 'Shop',
  components: { SkuCard },
  setup(props, { root }) {
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
      const res = await Promise.all([
        loadCategories(),
        useApi().shop.loadConfig(),
        useApi().shop.loadBanners(),
      ]);
      cateId.value = 1;
      banners.value = res.length > 2 ? res[2] : [];
    });

    const goto = (url: string) => {
      if (url.startsWith('http')) {
        openURL(url);
      } else if (url.startsWith('/')) {
        void root.$router.push(url);
      }
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