<template>
  <div @click="onClick">
    <q-card flat style="border-radius: 10px">
      <q-card-section class="column q-gutter-sm q-pa-sm">
        <div class="row justify-start items-center">
          <q-img :src="card.img" :ratio="8/5" width="90px" contain />
          <div class="column q-px-sm justify-center">
            <div class="text-accent">{{card.productName}}</div>
            <div>{{price}}</div>
            <div
              class="text-positive text-caption"
            >{{$t('cardItem.label.validBefore')}}: {{validBefore}}</div>
          </div>
        </div>
        <div class="col row justify-end">
          <div class="text-grey text-caption self-end">{{boughtAt}}</div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api';
import {
  Card,
  useSelectedCard,
  useShowCardinfo,
} from 'src/compositions/shop/order';
import { AmountUnit, Amount } from '@lay2/pw-core';
export default defineComponent({
  name: 'CardItem',
  props: {
    card: {
      required: true,
      type: (Object as unknown) as PropType<Card>,
    },
  },
  setup(props) {
    const card = props.card;

    const validBefore = computed(() =>
      new Date(card.expiresTime).toLocaleString()
    );
    const boughtAt = computed(() => new Date(card.buyTime).toLocaleString());
    const price = computed(() => {
      const tokenAmount = new Amount(card.payTokenAmount, AmountUnit.shannon);
      return `¥ ${card.sellPrice / 100} (${tokenAmount.toString(undefined, {
        commify: true,
        fixed: 2,
      })} ${card.payToken})`;
    });

    const onClick = () => {
      useSelectedCard().value = card;
      useShowCardinfo().value = true;
    };

    return {
      price,
      validBefore,
      boughtAt,
      onClick,
    };
  },
});
</script>
