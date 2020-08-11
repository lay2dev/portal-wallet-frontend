<template>
  <div class="column">
    <div class="row q-pa-sm justify-between items-center" @click="!pending && $emit('click')">
      <div class="row items-center">
        <q-spinner-bars v-if="pending" color="grey" />
        <q-icon v-else color="indigo-4" size="1.2em" name="south" />
        <div class="column q-ml-xs">
          <div
            class="q-ml-xs text-accent"
            :class="pending && `text-grey`"
          >{{fromAmount}} {{tx.fromSymbol}}</div>
          <div
            class="q-ml-xs text-accent"
            :class="pending && `text-grey`"
          >{{toAmount}} {{tx.toSymbol}}</div>
        </div>
      </div>
      <div class="column items-center">
        <div class="text-grey text-caption">{{time.time}}</div>
        <div class="text-grey text-caption">{{time.date}}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api';
import { SwapTX, displayFromAmount, SwapTxStatus } from '../compositions/swap';
import { AmountUnit, Amount } from '@lay2/pw-core';

export default defineComponent({
  name: 'SwapTxItem',
  props: {
    tx: {
      type: SwapTX,
      required: true,
    },
  },
  setup(props) {
    const pending = computed(() => props.tx.status !== SwapTxStatus.DELIVERED);
    const fromAmount = computed(() =>
      displayFromAmount(props.tx.fromAmount, props.tx.fromDecimal)
    );
    const toAmount = computed(() =>
      new Amount(props.tx.toAmount || '0', AmountUnit.shannon).toString(
        undefined,
        {
          commify: true,
          fixed: 4,
        }
      )
    );

    const time = computed(() => {
      const date = new Date(props.tx.time).toLocaleDateString();
      const time = new Date(props.tx.time).toLocaleTimeString();
      return { date, time };
    });

    return {
      pending,
      fromAmount,
      toAmount,
      time,
    };
  },
});
</script>
