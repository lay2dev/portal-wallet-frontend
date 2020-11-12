<template>
  <q-page class="column">
    <q-toolbar v-if="showHeader" class="bg-accent text-white">
      <q-btn flat size="sm" round icon="arrow_back_ios" to="/" replace />
      <q-toolbar-title class="text-center text-subtitle1 text-bold">{{
        $t('send.title')
      }}</q-toolbar-title>
      <q-btn flat round icon="more_vert" class="invisible" />
    </q-toolbar>

    <q-card class="bg-white no-border-radius shadow-up-1">
      <q-card-section class="column justify-between">
        <div class="text-grey">{{ $t('send.label.asset') }}</div>
        <div class="row col justify-between items-center">
          <asset-select dense :asset.sync="selectedAsset" :assets="assets" />
          <div class="text-bold">
            {{
              `${displayBalance(selectedAsset)} ${
                selectedAsset && selectedAsset.symbol
              }`
            }}
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="bg-grey q-my-sm"></div>

    <q-card flat class="bg-white">
      <q-card-section class="column q-py-xs">
        <div class="row text-grey justify-between items-center">
          <div>{{ $t('send.label.address') }}</div>
          <div>
            <q-btn round dense flat icon="qr_code_scanner" @click="scan" />
            <q-btn
              round
              dense
              flat
              icon="contacts"
              @click="showContacts = true"
            />
          </div>
        </div>
        <q-input
          v-model="address"
          dense
          debounce="300"
          input-class="text-bold"
          input-style="font-size: 0.8em"
          standout="bg-secondary"
          clearable
          autogrow
          type="text"
          :placeholder="$t('send.msg.address')"
          :rules="[(val) => pair.valid.address]"
          :disable="resolvingEns"
          :loading="resolvingEns"
          hide-bottom-space
        >
          <template v-slot:after> </template>
          <template v-slot:loading>
            <q-spinner-facebook color="grey" />
          </template>
        </q-input>
        <div class="text-grey q-py-sm">
          <div>{{ $t('send.label.amount') }}</div>
        </div>
        <q-input
          class="col"
          type="number"
          input-class="text-bold"
          input-style="font-size: 1.2em"
          v-model="amount"
          dense
          debounce="300"
          standout="bg-secondary"
          clearable
          autogrow
          :suffix="selectedAsset && selectedAsset.symbol"
          :rules="[(val) => pair.valid.amount]"
          @blur="amount = pair.amount.toString(undefined, { commify: true })"
          hide-bottom-space
        >
          <template v-slot:after> </template>
        </q-input>
        <div>
          <q-separator class="q-mt-sm" />
        </div>
        <div class="row justify-between items-center text-grey">
          <fee-bar :builder="builder" />
          <div
            class="row col justify-end items-center no-wrap"
            @click="showNote = true"
          >
            <div class="ellipsis text-caption q-px-xs" style="max-width: 200px">
              {{
                note ? $t('send.label.note') + ': ' : $t('send.label.addNote')
              }}
              <span class="text-white">{{ note }}</span>
            </div>
            <q-btn
              flat
              round
              size="sm"
              color="grey-5"
              :icon="note ? 'edit' : 'note_add'"
              @click="showNote = true"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
    <div class="row absolute-bottom justify-center q-pa-lg q-ma-lg">
      <q-btn
        class="col-6"
        size="1.2em"
        color="secondary"
        @click="onSend"
        :disable="building || !canSend"
        :loading="building"
      >
        {{ $t('send.btn.send') }}
        <template v-slot:loading>
          <q-spinner-facebook color="white" />
        </template>
      </q-btn>
    </div>

    <!-- <div class="column col q-mt-md">
      <q-card flat class="filter-card">
        <q-tabs
          v-model="filter.direction"
          dense
          no-caps
          inline-label
          indicator-color="transparent"
          class="bg-white text-grey"
          active-color="accent"
          active-bg-color="grey-1"
        >
          <q-tab name="all" icon="swap_vert" :label="$t('send.label.all')" />
          <q-tab name="in" icon="arrow_downward" :label="$t('send.label.in')" />
          <q-tab name="out" icon="arrow_upward" :label="$t('send.label.out')" />
        </q-tabs>
        <q-separator />
      </q-card>
      <tx-list :direction="filter.direction" />
    </div>
    <q-page-scroller
      position="bottom-right"
      :scroll-offset="150"
      :offset="[18, 32]"
    >
      <q-btn fab icon="keyboard_arrow_up" color="accent" />
    </q-page-scroller>-->
    <q-dialog v-model="showNote" persistent>
      <q-card style="min-width: 280px">
        <q-card-section>
          <div class="text-h6">{{ $t('send.label.note') }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input dense v-model="noteTemp" autogrow autofocus clearable />
        </q-card-section>
        <q-card-actions align="right" class="text-accent">
          <q-btn
            outline
            color="negative"
            no-caps
            :label="$t('send.btn.cancel')"
            @click="noteTemp = note"
            v-close-popup
          />
          <q-btn
            unelevated
            color="primary"
            no-caps
            :label="$t('send.btn.ok')"
            @click="note = noteTemp"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showContacts" position="bottom">
      <contact-select @onSelect="(addr) => (address = addr)" />
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { useConfig } from '../compositions/config';
import {
  useReceivePair,
  useBuilding,
  useSending,
  setAmount,
  setAddress,
  useNote,
  useIsBatch,
  isValidAddress,
  isValidAmount,
  useConfirmSend,
  useSendMode,
  scanQR,
} from '../compositions/send';
import {
  computed,
  onMounted,
  ref,
  defineComponent,
  PropType,
  watch,
} from '@vue/composition-api';
import PWCore, {
  SimpleBuilder,
  Address,
  Amount,
  EthProvider,
  Builder,
} from '@lay2/pw-core';
import FeeBar from '../components/FeeBar.vue';
import TxList from '../components/TxList.vue';
import ContactSelect from '../components/ContactSelect.vue';
import AssetSelect from '../components/AssetSelect.vue';
import {
  useTxFilter,
  useAccount,
  useAssets,
  Asset,
} from '../compositions/account';
import { ClearBuilder } from 'src/compositions/clear-builder';
import GTM from '../compositions/gtm';

export default defineComponent({
  name: 'Send',
  components: { FeeBar, TxList, ContactSelect, AssetSelect },
  props: {
    asset: {
      type: (Object as unknown) as PropType<Asset>,
    },
  },
  setup(props, { root }) {
    const filter = useTxFilter();
    const ens = ref('');
    const note = useNote();
    const pair = useReceivePair();
    const building = useBuilding();
    const address = ref('');
    const amount = ref('');
    const sending = useSending();
    const assets = useAssets();
    const selectedAsset = ref<Asset>(assets.value[0]);

    const balance = computed(() =>
      useAccount().balance.value.toString(undefined, {
        commify: true,
        fixed: 4,
      })
    );

    const displayBalance = (asset: Asset) => {
      if (!asset) return '0';
      const balance = asset.sudt ? asset.sudtAmount : asset.capacity;
      return balance.toString(asset.decimals, { commify: true, fixed: 4 });
    };

    const canSend = computed(() => pair.isValidPair());
    const needClear = computed(() => {
      if (useAccount().balance.value.gt(Amount.ZERO)) {
        const neededAmount = pair.amount.add(Builder.MIN_CHANGE);
        return useAccount().balance.value.lte(neededAmount);
      }
      return false;
    });
    const builder = computed(() =>
      pair.isValidPair()
        ? needClear.value
          ? new ClearBuilder(pair.address as Address)
          : new SimpleBuilder(pair.address as Address, pair.amount as Amount)
        : undefined
    );

    const onSend = () => {
      if (needClear.value) {
        showSendSelect();
      } else {
        useConfirmSend().value = true;
      }
    };

    const scan = async () => {
      address.value = await scanQR();
      GTM.logEvent({
        category: 'Actions',
        action: 'scan-qr',
        label: address.value,
        value: new Date().getTime(),
      });
    };

    onMounted(() => {
      amount.value = '100';
      useIsBatch().value = false;
      useSendMode().value = 'local';
    });

    const showSendSelect = () => {
      root.$q
        .dialog({
          title: root.$t('send.label.caution').toString(),
          message: root.$t('send.msg.clear').toString(),
          ok: {
            label: root.$t('send.btn.sendAll'),
            flat: true,
          },
          cancel: {
            label: root.$t('send.btn.cancel'),
            flat: true,
            color: 'grey',
            noCaps: true,
          },
        })
        .onOk(() => {
          useSendMode().value = 'clear';
          pair.amount = setAmount(balance.value);
          useConfirmSend().value = true;
        });
    };

    watch(assets, () => {
      selectedAsset.value = props.asset || assets.value[0];
    });

    return {
      showHeader: useConfig().showHeader,
      showBatch: process.env.RC,
      showNote: ref(false),
      showContacts: ref(false),
      pair,
      address,
      assets,
      selectedAsset,
      displayBalance,
      amount,
      balance,
      builder,
      building,
      ens,
      resolvingEns: ref(false),
      canSend,
      onSend,
      sending,
      scan,
      filter,
      note,
      noteTemp: ref(''),
    };
  },
  watch: {
    address(address: string | undefined) {
      if (address === undefined || address === null) {
        this.pair.address = undefined;
        this.pair.valid.address = isValidAddress(this.pair.address);
      } else {
        if (address.endsWith('.eth')) {
          this.ens = address;
          return;
        }
        try {
          this.pair.address = setAddress(address);
          this.pair.valid.address = isValidAddress(this.pair.address);
        } catch (e) {
          this.pair.valid.address = (e as Error).message;
          this.pair.address = undefined;
        }
      }
    },
    amount(amount: string | undefined) {
      try {
        this.pair.amount = setAmount(amount);
        this.pair.valid.amount = isValidAmount(this.pair.amount as Amount);
      } catch (e) {
        this.pair.valid.amount = (e as Error).message;
        this.pair.amount = Amount.ZERO;
      }
    },
    async ens(ens: string) {
      if (ens.endsWith('.eth')) {
        this.resolvingEns = true;
        const addr = await (PWCore.provider as EthProvider).ensResolver(ens);
        if (addr.startsWith('0x')) {
          // this.pair.address = new Address(addr, AddressType.eth);
          this.address = addr;
        } else {
          this.pair.valid.address = this.$t('send.msg.wrongEns').toString();
          this.pair.address = undefined;
        }
        this.ens = '';
        this.resolvingEns = false;
        GTM.logEvent({
          category: 'Actions',
          action: 'resolve-ens',
          label: ens,
          value: new Date().getTime(),
        });
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.quick-send-card {
  border-radius: 0;
  border-bottom-left-radius: 10%;
  border-bottom-right-radius: 10%;
}
.filter-card {
  border-radius: 10%;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.tx-records-card {
  border-radius: 0;
}
</style>