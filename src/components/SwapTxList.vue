<template>
  <div
    class="column q-py-xs bg-white relative-position"
    style="border-radius: 5px"
  >
    <div v-if="swapTxs.length">
      <swap-tx-item
        class="tx-item q-ma-sm bg-grey-1"
        v-for="tx in swapTxs"
        :key="tx.id"
        :tx="tx"
        @click="showTx(tx)"
      />
      <q-btn
        v-if="more"
        class="full-width"
        flat
        color="grey"
        dense
        no-caps
        :label="swapTxsLoading ? $t('txlist.msg.loading') : hasMore ? $t('txlist.btn.loadMore') : '~'"
        :disable="!hasMore"
        @click="loadMore"
      />
    </div>
    <div
      v-else
      class="text-grey-4 column q-pa-lg q-gutter-sm items-center"
    >
      <div class="text-subtitle2"> {{$t('txlist.msg.empty')}} </div>
      <q-icon
        name="space_bar"
        size="5em"
      />
    </div>
    <q-inner-loading :showing="swapTxsLoading">
      <q-spinner-facebook
        size="48px"
        color="accent"
      />
    </q-inner-loading>
    <q-dialog
      v-if="selectedTx"
      v-model="showTxDetail"
    >
      <q-card style="width: 700px; max-width:80vw">
        <q-card-section class="section column items-center q-mt-sm q-gutter-xs">
          <q-avatar
            icon="done"
            size="2.5em"
            font-size="0.7em"
            color="primary"
            text-color="white"
          />
          <span class="text-caption text-grey">{{selectedTx.getDateTimeString()}}</span>
        </q-card-section>
        <q-card-section class="section column q-gutter-sm">
          <div class="column">
            <span class="text-caption text-grey">{{$t('swap.label.sendAmount')}}:</span>
            <span class="text-bold text-dark">{{displayFromAmount(selectedTx.fromAmount, selectedTx.fromDecimal)}} {{selectedTx.fromSymbol}}</span>
          </div>
          <div class="column">
            <span class="col-3 text-caption text-grey">{{$t('swap.label.hash')}}:</span>
            <span
              class="col-8 text-caption text-dark"
              style="word-break: break-word"
            >{{selectedTx.fromHash}}
              <q-btn
                color="grey"
                icon="content_copy"
                size="xs"
                round
                dense
                flat
                @click="copy(selectedTx.fromHash)"
              />
            </span>
          </div>
        </q-card-section>
        <q-card-section class="section column q-gutter-sm">
          <div class="column">
            <span class="text-caption text-grey">{{$t('swap.label.receiveAmount')}}:</span>
            <span class="col text-bold text-dark">{{displayCkbAmount(selectedTx.toAmount)}} CKB</span>
          </div>
          <div class="column">
            <span class="col-3 text-caption text-grey">{{$t('swap.label.hash')}}:</span>
            <span
              class="col-8 text-caption text-dark"
              style="word-break: break-word"
            >{{selectedTx.toHash}}
              <q-btn
                color="grey"
                icon="content_copy"
                size="xs"
                round
                dense
                flat
                @click="copy(selectedTx.toHash)"
              />
            </span>
          </div>
        </q-card-section>
        <q-card-actions vertical>
          <q-btn
            flat
            no-caps
            :label="$t('txlist.btn.close')"
            color="dark"
            v-close-popup
          />
        </q-card-actions>
      </q-card>

    </q-dialog>
  </div>
</template>

<script lang="ts">
  import {
    defineComponent,
    onMounted,
    ref,
    computed
  } from '@vue/composition-api';
  import { openURL, copyToClipboard, Notify } from 'quasar';
  import { truncatedAddress } from 'src/compositions/account';
  import SwapTxItem from './SwapTxItem.vue';
  import { AmountUnit, Amount } from '@lay2/pw-core';
  import {
    loadSwapTxs,
    useSwapTxs,
    SwapTX,
    useHasMoreSwapTxs,
    displayFromAmount
  } from '../compositions/swap';
  import { i18n } from '../boot/i18n';

  export default defineComponent({
    name: 'SwapTxList',
    components: { SwapTxItem },
    setup() {
      onMounted(async () => {
        loadSwapTxs();
      });
      const { swapTxs, swapTxsLoading } = useSwapTxs();
      const selectedTx = ref<SwapTX | undefined>(undefined);
      const showTxDetail = ref(false);
      const showTx = (tx: SwapTX) => {
        console.log('[tx selected:]', tx);
        selectedTx.value = tx;
        showTxDetail.value = true;
      };
      const displayCkbAmount = (amount: string) =>
        new Amount(amount, AmountUnit.shannon).toString(AmountUnit.ckb, {
          commify: true
        });
      const openExplorer = (url: string) => {
        openURL(url);
      };

      const lastId = computed(() => {
        const length = swapTxs.value.length;
        return length ? swapTxs.value[length - 1].id : undefined;
      });

      const loadMore = async () => {
        await loadSwapTxs(lastId.value);
      };

      const copy = async (content: string) => {
        await copyToClipboard(content);
        Notify.create({
          message: i18n.t('common.copied').toString(),
          type: 'positive',
          timeout: 2000
        });
      };

      return {
        more: ref(true),
        swapTxs,
        selectedTx,
        swapTxsLoading,
        showTx,
        showTxDetail,
        displayCkbAmount,
        displayFromAmount,
        truncatedAddress,
        openExplorer,
        copy,
        hasMore: useHasMoreSwapTxs(),
        loadMore
      };
    }
  });
</script>

<style lang="scss" scoped>
  .tx-item {
    border-radius: 5px;
  }
  .section {
    border-bottom: 1px lightgray dashed;
  }
</style>