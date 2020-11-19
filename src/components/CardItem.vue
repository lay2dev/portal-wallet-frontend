<template>
  <div @click="onClick">
    <q-card flat style="border-radius: 10px">
      <q-card-section class="column q-gutter-sm q-pa-sm">
        <div class="row justify-start items-center">
          <q-img :src="card.img" :ratio="8/5" width="90px" contain />
          <div class="column q-px-sm justify-center">
            <div class="q-pb-xs" :class="used ? 'text-grey' : 'text-accent'">{{card.productName}}</div>
            <div class="q-gutter-xs">
              <span :class="used && 'text-grey'">{{fiatPrice}}</span>
              <span class="text-grey">{{tokenPrice}}</span>
            </div>
            <div
              v-if="card.buyTime"
              class="text-caption"
              :class="used ? 'text-grey' : 'text-positive'"
            >{{$t('cardItem.label.validBefore')}}: {{validBefore}}</div>
          </div>
        </div>
        <div class="col row justify-end">
          <div class="row q-gutter-xs text-grey text-caption items-center self-end">
            <q-spinner-facebook v-if="!card.buyTime" />
            <span>{{card.buyTime ? boughtAt : $t('cardItem.msg.pending')}}</span>
          </div>
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
  CardStatus,
} from 'src/compositions/shop/order';
import { AmountUnit, Amount } from '@lay2/pw-core';
import { useSudts } from 'src/compositions/account';
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
    const fiatPrice = computed(() => `¥ ${card.sellPrice / 100}`);
    const tokenDecimal = card.payToken === 'CKB'? 8: useSudts().value.filter(x => x.symbol === card.payToken)[0].decimals;
    // const asset = useAssets().value.filter(x => x.symbol === card.payToken)[0];
    // const sudt = useSudts().value.filter(x => x.symbol === card.payToken)[0];

    const tokenPrice = computed(() => {
      if (!card.payTokenAmount) return undefined;
      const tokenAmount = new Amount(card.payTokenAmount, AmountUnit.shannon);
      return `(${tokenAmount.toString(tokenDecimal, {
        commify: true,
        fixed: 4,
      })} ${card.payToken})`;
    });
    const used = computed(() => card.status === CardStatus.FINISHED);

    const onClick = () => {
      if (!card.buyTime) return;
      useSelectedCard().value = card;
      useShowCardinfo().value = true;
    };

    return {
      fiatPrice,
      tokenPrice,
      validBefore,
      used,
      boughtAt,
      onClick,
    };
  },
});
</script>
