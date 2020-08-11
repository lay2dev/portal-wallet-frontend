<template>
  <q-page>
    <q-toolbar v-if="showHeader" class="bg-accent text-white">
      <q-btn flat size="sm" round icon="arrow_back_ios" to="/shop" replace />
      <q-toolbar-title class="text-center text-subtitle1 text-bold">{{ $t('orders.title') }}</q-toolbar-title>
      <q-btn flat round icon="more_vert" class="invisible" />
    </q-toolbar>
    <q-tabs v-model="tab" no-caps class="bg-accent text-white">
      <q-tab name="paid" :label="$t('orders.label.paid')" />
      <!-- <q-tab name="used" :label="$t('orders.label.used')" /> -->
      <q-tab name="service" :label="$t('orders.label.service')" />
      <q-tab name="refunded" :label="$t('orders.label.refunded')" />
    </q-tabs>
    <div class="column q-py-md q-px-sm q-gutter-md relative-position">
      <card-item v-for="card in cards" :key="card.cardId" :card="card" />
      <div v-if="!cards.length" class="text-grey-4 column q-pa-lg q-gutter-sm items-center">
        <div class="text-subtitle2">{{$t('orders.msg.empty')}}</div>
        <q-icon name="space_bar" size="5em" />
      </div>
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab padding="0.9em" icon="headset" color="accent" @click="showServiceDialog = true" />
      </q-page-sticky>
      <q-dialog v-if="config" v-model="showServiceDialog">
        <q-card>
          <q-card-section class="column items-center">
            <q-img :src="config.img" />
            <span class="text-h6">{{config.name}}</span>
            <span class="q-ma-sm">{{$t('shop.msg.service')}}</span>
          </q-card-section>
        </q-card>
      </q-dialog>
      <q-inner-loading :showing="cardsLoading">
        <q-spinner-facebook size="50px" color="accent" />
      </q-inner-loading>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from '@vue/composition-api';
import { useConfig } from '../compositions/config';
import { loadCards, useCards } from 'src/compositions/shop/order';
import CardItem from '../components/CardItem.vue';
import { useShopConfig } from 'src/compositions/shop/shop';
import { useApi } from 'src/compositions/api';

export default defineComponent({
  name: 'Orders',
  components: {
    CardItem,
  },
  setup() {
    const cardsLoading = ref(false);
    const cards = useCards();
    const tab = ref('paid');
    const showServiceDialog = ref(false);
    const config = useShopConfig();

    onMounted(async () => {
      cardsLoading.value = true;
      if (!config.value) {
        void useApi().shop.loadConfig();
      }
      await loadCards(tab.value);
      cardsLoading.value = false;
    });

    watch(tab, async (tab) => {
      cardsLoading.value = true;
      await loadCards(tab);
      cardsLoading.value = false;
    });

    watch(cardsLoading, (loading) => {
      console.log('[Orders.vue] loading ', loading);
    });

    return {
      showHeader: useConfig().showHeader,
      tab,
      cardsLoading,
      cards,
      config,
      showServiceDialog,
    };
  },
});
</script>
