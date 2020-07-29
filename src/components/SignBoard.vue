<template>
  <div class="bg-grey-2 column">
    <q-toolbar class="bg-transparent text-dark">
      <q-btn flat round dense icon="close" v-close-popup />
      <center class="col">{{$t('signBoard.label.txDetail')}}</center>
      <q-btn flat round dense icon="more_vert" class="invisible" />
    </q-toolbar>
    <q-card flat class="q-mx-md detail-card">
      <q-card-section>
        <div class="row justify-center text-h6 text-accent">{{amount}} CKB</div>
        <q-separator spaced />
        <div class="column q-gutter-xs">
          <div class="text-caption text-grey">{{$t('signBoard.label.to')}}:</div>
          <div style="word-break: break-word" class="text-caption text-dark">{{to}}</div>
        </div>
        <q-separator spaced />
        <div class="column q-gutter-xs">
          <div class="text-caption text-grey">{{$t('signBoard.label.from')}}:</div>
          <div style="word-break: break-word" class="text-caption text-dark">{{from}}</div>
        </div>
        <q-separator spaced />
        <div class="row q-gutter-xs">
          <div class="text-caption text-grey">{{$t('signBoard.label.fee')}}:</div>
          <div class="text-caption text-dark">{{fee}} CKB</div>
          <div class="text-caption text-grey">({{$t('signBoard.label.rate')}}: {{rate}})</div>
        </div>
        <q-separator spaced />
        <div class="row q-gutter-xs">
          <div class="text-caption text-grey">{{$t('signBoard.label.note')}}:</div>
          <div class="text-caption text-dark">{{note}}</div>
        </div>
      </q-card-section>
    </q-card>
    <q-btn
      class="q-ma-md"
      no-caps
      color="primary"
      :label="$t('signBoard.btn.confirm')"
      @click="$emit('send')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api';
import {
  useReceivePair,
  useFee,
  useRate,
  useReceivePairs,
  useIsBatch,
  useNote,
} from '../compositions/send';
import PWCore, { AmountUnit } from '@lay2/pw-core';
export default defineComponent({
  name: 'SignBoard',
  setup() {
    const isSendBatch = useIsBatch();

    const from = PWCore.provider.address.addressString;

    const to = computed(() => {
      let address = useReceivePair().address;
      if (isSendBatch && useReceivePairs().value.length) {
        address = useReceivePairs().value[0].address;
        return `${address?.addressString || '-'} (...)`;
      }
      return address?.addressString || '-';
    });

    const amount = computed(() => {
      let amount = useReceivePair().amount;
      if (isSendBatch && useReceivePairs().value.length) {
        amount = useReceivePairs()
          .value.map((rp) => rp.amount)
          .reduce((sum, a) => sum.add(a));
      }
      return amount.toString(AmountUnit.ckb, { commify: true, fixed: 4 });
    });
    const fee = computed(() => useFee().value.toString(AmountUnit.ckb));
    const rate = useRate();
    return { from, to, amount, fee, rate, note: useNote() };
  },
});
</script>

<style lang="scss" scoped>
.detail-card {
  border-radius: 5px;
}
</style>
