<template>
  <div class="column q-px-md">
    <q-card style="border-top-left-radius: 20px;border-top-right-radius: 20px;">
      <q-card-section class="text-center">
        <q-img :src="card.icon" :ratio="1/1" width="64px" />
        <div class="text-h6">{{ card.productName }}</div>
        <div class="text-positive">{{$t('cardInfo.label.validBefore')}}: {{validBefore}}</div>
        <q-separator spaced />
        <vue-qrcode v-if="!!card.uniqueCode" :value="card.uniqueCode" :margin="1" :width="200" />
        <div v-if="!!card.cardPwd" class="text-h6 text-accent bg-grey-2 q-pa-lg">{{ card.cardPwd}}</div>
        <q-separator spaced />
        <div class="text-left q-px-sm" style="white-space: pre-line;">{{ card.description }}</div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api';
import { useSelectedCard } from '../compositions/shop/order';
import VueQrcode from 'vue-qrcode';

export default defineComponent({
  name: 'CardInfo',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  components: { VueQrcode },
  setup() {
    const card = useSelectedCard();
    const validBefore = computed(() =>
      card.value ? new Date(card.value.expiresTime).toLocaleString() : '-'
    );

    return { card, validBefore };
  },
});
</script>
