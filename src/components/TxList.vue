<template>
  <div class="column q-py-xs bg-white relative-position">
    <div v-if="txList.length">
      <tx-item
        class="tx-item q-ma-sm bg-grey-1"
        v-for="tx in txList"
        :key="tx.hash"
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
        :label="txsLoading ? $t('txlist.msg.loading') : hasMore ? $t('txlist.btn.loadMore') : '~'"
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
    <q-inner-loading :showing="txsLoading">
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
          <span class="text-bold text-dark">{{$t(`txlist.msg.${selectedTx.direction}`)}}</span>
          <span class="text-caption text-grey">{{selectedTx.getDateTimeString()}}</span>
        </q-card-section>
        <q-card-section class="section column q-gutter-xs">
          <div class="row">
            <span class="col-3 text-caption text-grey">{{$t('txlist.label.amount')}}:</span>
            <span class="col-8 text-bold text-dark">{{displayAmount(selectedTx.amount)}} CKB</span>
          </div>
          <div class="row">
            <span class="col-3 text-caption text-grey">{{$t('txlist.label.fee')}}:</span>
            <span class="col-8 text-caption text-dark">{{displayAmount(selectedTx.fee)}} CKB</span>
          </div>
          <div class="row">
            <span class="col-3 text-caption text-grey">{{$t('txlist.label.from')}}:</span>
            <span
              class="col-8 text-caption text-dark"
              style="word-break: break-word"
            >{{selectedTx.from.addressString}}</span>
          </div>
          <div class="row">
            <span class="col-3 text-caption text-grey">{{$t('txlist.label.to')}}:</span>
            <span
              class="col-8 text-caption text-dark"
              style="word-break: break-word"
            >{{selectedTx.to.addressString}}</span>
          </div>
        </q-card-section>
        <q-card-section class="section column q-gutter-xs">
          <div class="row">
            <span class="col-3 text-caption text-grey">{{$t('txlist.label.hash')}}:</span>
            <span class="col-8 text-caption text-dark">{{truncatedAddress(selectedTx.txHash)}}</span>
          </div>
          <div class="row">
            <span class="col-3 text-caption text-grey">{{$t('txlist.label.height')}}:</span>
            <span class="col-8 text-caption text-dark">{{selectedTx.blockNumber}}</span>
          </div>
          <div
            v-if="selectedTx.direction === 'out'"
            class="row"
          >
            <span class="col-3 text-caption text-grey">{{$t('txlist.label.note')}}:</span>
            <span
              class="col-8 text-caption text-grey-7 cursor-pointer"
              style="word-break: break-word; text-decoration: underline;"
            >
              {{selectedTx.note || $t('send.label.addNote')}}
              <q-spinner-facebook
                class="q-ml-xs"
                v-show="savingNote"
              />
              <q-popup-edit
                v-model="selectedTx.note"
                buttons
                @save="saveNote"
              >
                <q-input
                  v-model="selectedTx.note"
                  autogrow
                  clearable
                  dense
                  autofocus
                />
              </q-popup-edit>
            </span>
          </div>
        </q-card-section>
        <q-card-actions vertical>
          <q-btn
            flat
            no-caps
            :label="$t('txlist.btn.check')"
            color="primary"
            icon-right="open_in_new"
            @click="openExplorer(selectedTx.getUrl())"
          />
          <q-separator
            spaced
            inset
          />
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
  import { defineComponent, ref, computed } from '@vue/composition-api';
  import { openURL } from 'quasar';
  import {
    loadTxRecords,
    useTxRecords,
    TX,
    truncatedAddress,
    useHasMoreTxs
  } from 'src/compositions/account';
  import TxItem from './TxItem.vue';
  import { AmountUnit, Amount } from '@lay2/pw-core';
  import { useApi } from '../compositions/api';

  export default defineComponent({
    name: 'TxList',
    components: { TxItem },
    props: {
      direction: {
        type: String,
        default: 'all'
      },
      size: {
        type: Number
      },
      more: {
        type: Boolean,
        default: true
      }
    },
    setup(props) {
      let { txs, txsLoading } = useTxRecords();
      const txList = computed(() =>
        props.size ? txs.value.slice(0, props.size) : txs.value
      );
      const selectedTx = ref<TX | undefined>(undefined);
      const showTxDetail = ref(false);
      const showTx = (tx: TX) => {
        selectedTx.value = tx;
        showTxDetail.value = true;
      };
      const displayAmount = (amount: Amount) =>
        amount.toString(AmountUnit.ckb, { commify: true });
      const openExplorer = (url: string) => {
        openURL(url);
      };
      const lastHash = computed(() =>
        txs.value.length ? txs.value[txs.value.length - 1].txHash : undefined
      );
      const loadMore = async () => {
        await loadTxRecords({
          lastHash: lastHash.value,
          size: props.size,
          direction: props.direction
        });
      };

      const savingNote = ref(false);
      const saveNote = async () => {
        if (!!selectedTx.value) {
          savingNote.value = true;
          await useApi().addNote(
            selectedTx.value.txHash,
            selectedTx.value.note || ''
          );
          savingNote.value = false;
        }
      };

      const hasMore = useHasMoreTxs();
      return {
        txList,
        selectedTx,
        txsLoading,
        showTx,
        showTxDetail,
        loadMore,
        hasMore,
        displayAmount,
        truncatedAddress,
        openExplorer,
        saveNote,
        savingNote
      };
    },
    watch: {
      async direction(direction: string) {
        await loadTxRecords({ direction });
      },
      async size(size: number) {
        await loadTxRecords({ size });
      }
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