<template>
  <div class="row q-pa-sm justify-between items-baseline" @click="!pending && $emit('click')">
    <div class="column">
      <div class="row items-center">
        <q-spinner-bars v-if="pending" color="grey" />
        <q-icon v-else :color="color" :name="icon" />
        <div class="q-ml-xs text-accent" :class="pending && `text-${color}`">{{address}}</div>
      </div>
      <div class="text-grey text-caption">{{time}}</div>
    </div>
    <div :class="`text-${color}`" class="text-bold">{{prefix}} {{amount}}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api';
import { TX, truncatedAddress } from '../compositions/account';
import { AmountUnit } from '@lay2/pw-core';

export default defineComponent({
  name: 'TxItem',
  props: {
    tx: {
      type: TX,
      required: true,
    },
  },
  setup(props) {
    const pending = computed(() => !props.tx.blockNumber);
    const tag = computed(() => (props.tx.direction === 'in' ? 'from' : 'to'));
    const address = computed(() =>
      truncatedAddress(props.tx[tag.value].addressString)
    );
    const amount = computed(() =>
      props.tx.amount.toString(AmountUnit.ckb, { commify: true, fixed: 4 })
    );
    const icon = computed(() =>
      tag.value === 'from'
        ? 'arrow_downward'
        : props.tx.outputCount && props.tx.outputCount > 2
        ? 'call_split'
        : 'arrow_upward'
    );
    const prefix = computed(() => (tag.value === 'from' ? '+' : '-'));
    const color = computed(() => {
      if (pending.value) return 'grey';
      return tag.value === 'from' ? 'primary' : 'blue-grey-6';
    });
    const time = computed(() => new Date(props.tx.time).toLocaleString());
    return { pending, address, amount, icon, prefix, color, time };
  },
});
</script>
