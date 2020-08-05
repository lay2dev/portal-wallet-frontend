<template>
  <div>
    <q-expansion-item dense dark expand-icon-toggle v-model="expanded" header-style="padding: 2px;">
      <template slot="header">
        <q-item-section>
          <div class="row items-center text-caption">
            <q-icon class="q-mr-xs text-grey-4" name="speed" />
            <div v-if="expanded">
              <span class="text-grey-4">{{$t('feebar.label.feeRate')}}:</span>
              <b class="q-mx-xs">{{rate}}</b>
              <span>Shn/KB</span>
            </div>
            <div class="row q-gutter-xs" v-else>
              <span class="text-grey-4">{{$t('feebar.label.fee')}}:</span>
              <div v-if="building">
                <q-spinner-facebook color="white" />
              </div>
              <span v-else>
                <b>{{feeAmount}}</b> CKB
              </span>
            </div>
          </div>
        </q-item-section>
      </template>
      <div class="q-px-lg">
        <q-slider
          v-model="rate"
          color="primary"
          dark
          markers
          dense
          snap
          :min="1000"
          :max="5000"
          :step="1000"
        />
      </div>
    </q-expansion-item>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  ref,
  computed,
  watch,
} from '@vue/composition-api';
import { Builder, Amount, Transaction } from '@lay2/pw-core';
import { useFee, useRate, useBuilding } from '../compositions/send';

export default defineComponent({
  name: 'FeeBar',
  props: {
    builder: {
      type: (Builder as unknown) as PropType<Builder>,
    },
  },
  setup(props) {
    const expanded = ref(false);
    const tx = ref<Transaction | undefined>();
    const rate = useRate();
    const fee = useFee();
    const building = useBuilding();
    const feeAmount = computed(() => fee.value.toString());

    watch(rate, async (rate) => {
      if (!tx.value && props.builder) {
        useBuilding().value = true;
        tx.value = await props.builder.build();
        useBuilding().value = false;
      }
      if (tx.value) fee.value = Builder.calcFee(tx.value, rate);
    });

    return {
      expanded,
      rate,
      fee,
      feeAmount,
      building,
    };
  },
  watch: {
    async builder(builder: Builder) {
      if (builder) {
        useBuilding().value = true;
        console.log('[FeeBar] building');
        const tx = await builder.build();
        this.fee = Builder.calcFee(tx, this.rate);
        useBuilding().value = false;
      } else {
        this.fee = Amount.ZERO;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.q-item--dense {
  padding-left: 0;
  padding-right: 0;
}
</style>
