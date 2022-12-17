<template>
  <q-page class="column">
    <q-toolbar v-if="showHeader" class="bg-accent text-white">
      <q-btn
        flat
        size="sm"
        round
        icon="arrow_back_ios"
        @click="$router.back()"
      />
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
          @blur="
            amount = pair.amount.toString(selectedAsset.decimals, {
              commify: true,
            })
          "
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
              <span class="text-gray">{{ note }}</span>
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
  useSelectedAsset,
} from '../compositions/send';
import {
  computed,
  onMounted,
  ref,
  defineComponent,
  watch,
} from '@vue/composition-api';
import PWCore, {
  SimpleBuilder,
  Address,
  Amount,
  EthProvider,
  Builder,
  SUDT,
} from '@lay2/pw-core';
import FeeBar from '../components/FeeBar.vue';
import ContactSelect from '../components/ContactSelect.vue';
import AssetSelect from '../components/AssetSelect.vue';
import { useAccount, useAssets, Asset } from '../compositions/account';
import { ClearBuilder } from 'src/compositions/clear-builder';
import GTM from '../compositions/gtm';
import { CoffeeBuilder } from 'src/compositions/coffee-builder';

export default defineComponent({
  name: 'Send',
  components: { FeeBar, ContactSelect, AssetSelect },
  setup(props, { root }) {
    const ens = ref('');
    const note = useNote();
    const pair = useReceivePair();
    const building = useBuilding();
    const address = ref('');
    const amount = ref('');
    const sending = useSending();
    // const selectedAsset = ref<Asset>();
    const selectedAsset = useSelectedAsset();

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

    const assets = computed(() =>
      useAssets().value.filter((a) => a.id !== 0 && a.id !== 999999)
    );
    const canSend = computed(() => pair.isValidPair());
    const needClear = computed(() => {
      if (useAccount().balance.value.gt(Amount.ZERO)) {
        const neededAmount = pair.amount.add(Builder.MIN_CHANGE);
        return useAccount().balance.value.lte(neededAmount);
      }
      return false;
    });
    const builder = computed(() => {
      if (pair.isValidPair()) {
        if (selectedAsset.value?.symbol === 'COFFEE') {
          return new CoffeeBuilder(
            new SUDT(selectedAsset.value.typeScript?.args as string),
            pair.address as Address,
            pair.amount as Amount
          );
        } else if (needClear.value) {
          return new ClearBuilder(pair.address as Address);
        } else {
          return new SimpleBuilder(
            pair.address as Address,
            pair.amount as Amount,
            { feeRate: 1000 }
          );
        }
      } else {
        return undefined;
      }
    });

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
      // amount.value = '100';
      if (assets) {
        selectAsset();
      }
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
          pair.amount = useAccount().balance.value;
          useConfirmSend().value = true;
        });
    };

    const selectAsset = () => {
      const id = root.$route.params.id || '-1';
      console.log('[Send] asset id: ', id);
      selectedAsset.value = assets.value.find((a) => `${a.id}` === id);
    };

    watch(assets, () => {
      selectAsset();
    });

    watch(selectedAsset, () => {
      // reset state
      amount.value = '';
      address.value = '';
      ens.value = '';
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
        this.pair.amount = setAmount(amount, this.selectedAsset?.decimals);
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
</style>
