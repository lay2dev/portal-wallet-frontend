<template>
  <q-page>
    <q-toolbar
      v-if="showHeader"
      class="bg-accent text-warning"
    >
      <q-btn
        flat
        size="sm"
        round
        icon="arrow_back_ios"
        to="/send"
        replace
      />
      <q-toolbar-title class="text-center text-subtitle1 text-bold">
        {{ $t('sendBatch.title') }}
      </q-toolbar-title>
      <q-btn
        flat
        round
        icon="more_vert"
        class="invisible"
      />
    </q-toolbar>
    <q-card
      flat
      class="bg-accent batch-send-card"
    >
      <q-tab-panels
        v-model="mode"
        class="bg-accent"
        animated
      >
        <q-tab-panel name="input">
          <div
            class="text-caption text-grey q-mb-sm q-px-xs"
            style="line-height: 1.3em;"
          > {{ $t('sendBatch.msg.inputHint') }} </div>
          <q-input
            v-model="input"
            dense
            :placeholder="$t('sendBatch.msg.inputFormat')"
            dark
            standout
            type="textarea"
          />
          <div class="row q-mt-sm justify-around items-center q-gutter-sm">
            <q-btn
              color="negative"
              icon="clear_all"
              outline
              rounded
              no-caps
              :label="$t('sendBatch.btn.clear')"
              @click="clear"
            />
            <q-btn
              color="primary"
              icon="construction"
              unelevated
              rounded
              no-caps
              :label="$t('sendBatch.btn.buildInput')"
              @click="buildInput"
            />
          </div>
        </q-tab-panel>
        <q-tab-panel name="import">
          <div
            class="text-caption text-grey q-mb-sm q-px-xs"
            style="line-height: 1.3em"
          > {{ $t('sendBatch.msg.linkHint') }} </div>
          <q-input
            v-model="link"
            dense
            autogrow
            :placeholder="$t('sendBatch.msg.linkFormat')"
            dark
            standout
            type="text"
          />
          <div class="row q-mt-sm justify-around items-center q-gutter-sm">
            <q-btn
              color="negative"
              icon="clear_all"
              outline
              rounded
              no-caps
              :label="$t('sendBatch.btn.clear')"
              @click="clear"
            />
            <q-btn
              color="primary"
              icon="construction"
              unelevated
              rounded
              no-caps
              :label="$t('sendBatch.btn.buildImport')"
              @click="buildImport"
            />
          </div>
        </q-tab-panel>
      </q-tab-panels>
      <!-- <q-tabs
        v-model="mode"
        no-caps
        inline-label
        indicator-color="transparent"
        active-color="warning"
        class="text-grey"
      >
        <q-tab
          name="input"
          icon="post_add"
          :label="$t('sendBatch.btn.input')"
          :ripple="false"
        />
        <q-tab
          name="import"
          icon="cloud_download"
          :label="$t('sendBatch.btn.import')"
          :ripple="false"
        />
      </q-tabs> -->
    </q-card>
    <div
      v-if="receivePairs.length"
      class="outputs-card bg-transparent q-mt-lg"
    >
      <div class="row justify-between items-center q-pa-sm bg-accent text-white">
        <div class="text-caption">{{$t('sendBatch.label.sum')}}: <b>{{sum}}</b> CKB</div>
        <fee-bar :builder="builder" />
      </div>
      <div
        class="pair-item row bg-white justify-between items-center"
        v-for="(pair, i) in receivePairs"
        :key="i"
      >
        <div>
          <div class="text-accent">{{truncatedAddress(pair.address.addressString, 32)}}</div>
          <div class="text-bold">{{displayCKB(pair.amount)}} CKB</div>
        </div>
        <q-btn
          icon="delete_outline"
          round
          dense
          outline
          size="sm"
          @click="removePair(i)"
        />
      </div>
      <div class="q-pa-md">
        <q-btn
          color="primary"
          class="full-width"
          rounded
          :label="$t('sendBatch.btn.send')"
          @click="confirmSend = true"
        />
      </div>
    </div>
    <q-page-scroller
      position="bottom-right"
      :scroll-offset="150"
      :offset="[18, 32]"
    >
      <q-btn
        fab
        icon="keyboard_arrow_up"
        color="accent"
      />
    </q-page-scroller>
    <q-dialog
      v-model="confirmSend"
      persistent
      position="bottom"
    >
      <q-card>
        <sign-board @send="onSend" />
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
  import {
    defineComponent,
    ref,
    computed,
    onMounted
  } from '@vue/composition-api';
  import SignBoard from 'src/components/SignBoard.vue';
  import FeeBar from 'src/components/FeeBar.vue';
  import { useConfig } from 'src/compositions/config';
  import {
    useReceivePairs,
    sendBatch,
    useBatchBuilder,
    Pair,
    useIsBatch
  } from 'src/compositions/send';
  import { truncatedAddress } from 'src/compositions/account';
  import { AmountUnit, Amount } from '@lay2/pw-core';
  import { QSpinnerBall } from 'quasar';
  export default defineComponent({
    name: 'SendBatch',
    components: { SignBoard, FeeBar },
    setup(props, { root }) {
      const input = ref('');
      const link = ref('');
      const receivePairs = useReceivePairs();
      const sum = computed(() =>
        receivePairs.value.length
          ? receivePairs.value
              .map(rp => rp.amount)
              .reduce((sum, a) => sum.add(a))
              .toString(AmountUnit.ckb, { commify: true })
          : '0'
      );
      const buildInput = () => {
        const entries = input.value.split('\n');
        const pairs = [];
        for (const entry of entries) {
          const [address, amount] = entry.trim().split(/\s*[,| ]\s*/);
          if (address && amount) {
            pairs.push(new Pair(address, amount));
          }
        }
        receivePairs.value = pairs;
      };

      const buildImport = () => {
        return;
      };

      const clear = () => {
        input.value = '';
        link.value = '';
        receivePairs.value = [];
      };

      const removePair = (i: number) => {
        receivePairs.value.length > 1 && receivePairs.value.splice(i, 1);
      };

      const confirmSend = ref(false);
      const onSend = async () => {
        root.$q.loading.show({
          spinner: (QSpinnerBall as unknown) as Vue,
          spinnerColor: 'accent',
          spinnerSize: 64,
          messageColor: 'white',
          backgroundColor: 'primary'
        });

        const txHash = await sendBatch();

        if (txHash) {
          root.$q.notify({
            color: 'primary',
            message: root.$i18n.t('sendBatch.msg.sent').toString(),
            timeout: 3000,
            position: 'bottom'
          });
          console.log('sent: ', txHash);
          confirmSend.value = false;
        }

        root.$q.loading.hide();
      };

      onMounted(() => {
        useIsBatch().value = true;
      });

      const displayCKB = (amount: Amount) =>
        amount.toString(AmountUnit.ckb, { commify: true });

      return {
        showHeader: useConfig().showHeader,
        mode: ref<'input' | 'import'>('input'),
        input,
        link,
        receivePairs,
        sum,
        truncatedAddress,
        buildInput,
        buildImport,
        clear,
        removePair,
        confirmSend,
        onSend,
        builder: useBatchBuilder(),
        displayCKB
      };
    }
  });
</script>
 
<style lang="scss" scoped>
  .batch-send-card {
    border-radius: 30% / 10%;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  .pair-item {
    padding: 8px 12px;
    margin: 8px;
    border: 1px black;
    border-radius: 5px;
  }
</style>