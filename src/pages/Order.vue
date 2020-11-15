<template>
  <q-page class="column">
    <q-toolbar v-if="showHeader" class="bg-accent text-white">
      <q-btn flat size="sm" round icon="arrow_back_ios" to="/shop" replace />
      <q-toolbar-title class="text-center text-subtitle1 text-bold">{{
        $t('order.title')
      }}</q-toolbar-title>
      <q-btn flat round icon="more_vert" class="invisible" />
    </q-toolbar>
    <div v-if="sku" class="col column justify-between">
      <q-card class="q-ma-md">
        <img :src="sku.img" />
        <q-card-section>
          <div class="row justify-between">
            <div class="text-h6">{{ sku.name }}</div>
            <div class="text-h6 text-negative">¥ {{ sku.sellPrice / 100 }}</div>
          </div>
          <q-separator spaced />
          <div class="text-caption text-dark" style="white-space: pre-line">
            {{ sku.description }}
          </div>
        </q-card-section>
      </q-card>
      <q-card class="q-ma-md">
        <q-card-section
          class="col row justify-between bg-white text-accent q-pa-none"
        >
          <div class="row col q-px-xs justify-between items-center">
            <div class="column q-pa-sm q-gutter-xs justify-center items-end">
              <div style="font-size: 1.3em; font-weight: 400; line-height: 1">
                <!-- {{ `${amount} ${selectedAsset.symbol}` }} -->
                {{ `${amount}` }}
              </div>
              <!-- <div style="font-size: 0.8em; line-height: 1" class="text-grey">
                {{ `1${}=${rate}CNY` }}
              </div> -->
            </div>
            <asset-select
              class="q-ml-sm"
              :asset.sync="selectedAsset"
              :assets="assets"
            />
            <fee-bar :builder="builder" class="hidden" />
          </div>
          <q-btn
            class="bg-warning q-px-md"
            flat
            no-caps
            size="1.3em"
            color="accent"
            :loading="placingOrder"
            :disable="placingOrder"
            :label="$t('order.btn.pay')"
            @click="onPay"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  onMounted,
  watch,
} from '@vue/composition-api';
import { SKU } from '../compositions/shop/sku';
import { useApi } from '../compositions/api';
import {
  Amount,
  Address,
  AddressType,
  SimpleBuilder,
  Builder,
  SUDT,
} from '@lay2/pw-core';
import {
  useConfirmSend,
  useReceivePair,
  useSelectedAsset,
  useSending,
  useSendMode,
} from '../compositions/send';
import { Notify, Loading, QSpinnerBall } from 'quasar';
import { i18n } from '../boot/i18n';
import FeeBar from '../components/FeeBar.vue';
import AssetSelect from '../components/AssetSelect.vue';
import { useOrderNo, useShopConfig } from '../compositions/shop/shop';
import { useConfig } from '../compositions/config';
import { useAccount, useAssets, useAuthorized } from 'src/compositions/account';
import GTM from '../compositions/gtm';
import { CoffeeBuilder } from 'src/compositions/coffee-builder';

export default defineComponent({
  name: 'Order',
  components: { FeeBar, AssetSelect },
  props: {
    sid: {
      type: String,
      required: true,
    },
  },
  setup(props, { root }) {
    const sku = ref<SKU | undefined>();
    const orderNo = useOrderNo();
    const tokenAmount = ref<Amount | undefined>();
    const amount = ref<string>('0.00');
    const expiresIn = ref(0);
    const placingOrder = ref(false);
    const builder = ref<Builder | undefined>();
    const sending = useSending();

    const selectedAsset = useSelectedAsset();
    const assets = computed(() =>
      useAssets().value.filter((a) => {
        if (sku.value?.cid === 1) {
          return a.symbol === 'CKB' || a.symbol == 'COFFEE';
        }
        return a.symbol === 'CKB';
      })
    );

    const pair = useReceivePair();

    const getBuilder = () => {
      if (selectedAsset.value?.symbol === 'COFFEE') {
        return new CoffeeBuilder(
          new SUDT(selectedAsset.value.typeScript?.args as string),
          pair.address as Address,
          pair.amount as Amount
        );
      } else if (pair.isValidPair()) {
        return new SimpleBuilder(
          pair.address as Address,
          pair.amount as Amount
        );
      } else {
        return undefined;
      }
    };

    onMounted(() => {
      void init();
    });

    const getAmount = () =>
      (tokenAmount.value || Amount.ZERO).toString(
        selectedAsset.value?.decimals,
        { commify: true, fixed: 2 }
      );

    const stop = watch(useAuthorized(), (auth) => {
      stop();
      auth && init();
    });

    watch(assets, () => {
      if(!selectedAsset.value){
         selectedAsset.value = assets.value[0];
      }
    });

    watch(selectedAsset, () => {
      void init();
    });

    const init = async () => {
      console.warn('enter init', sku.value, selectedAsset.value);
      if(!sku.value) sku.value = await useApi().shop.loadSku(Number(props.sid));
      if (!selectedAsset.value) {
        // loading(false);
        return;
      }

      loading(true);
      useSendMode().value = 'remote';
      const config = useShopConfig();
      if (!config.value) {
        await useApi().shop.loadConfig();
      }

      if (!!config.value) {
        useReceivePair().address = new Address(
          config.value.paymentList.filter(
            (x) => x.token === selectedAsset.value?.symbol
          )[0].address,
          AddressType.ckb
        );
      } else {
        throw new Error('Shop config undefined');
      }

      loading(false);

      placingOrder.value = true;
      amount.value = '0.00';
      orderNo.value = await useApi().shop.placeOrder(Number(props.sid), 1);
      if (!!orderNo.value) {
        const res = await useApi().shop.prePayOrder(
          orderNo.value,
          selectedAsset.value?.symbol
        );
        if (!!res) {
          tokenAmount.value = new Amount(
            res.tokenAmount.toString(),
            selectedAsset.value?.decimals
          );
          pair.amount = tokenAmount.value;
          expiresIn.value = res.expiresIn;

          builder.value = getBuilder();
          amount.value = getAmount();

          // builder.value = new SimpleBuilder(
          //   useReceivePair().address as Address,
          //   useReceivePair().amount as Amount
          // );
        }
      }
      placingOrder.value = false;
    };

    const onPay = () => {
      if (expiresIn.value < new Date().getTime()) {
        Notify.create({
          type: 'negative',
          message: i18n.t('order.msg.expired').toString(),
          timeout: 3000,
        });
        return;
      }
      if (tokenAmount.value instanceof Amount) {
        if (useAccount().balance.value?.lte(tokenAmount.value)) {
          Notify.create({
            type: 'warning',
            message: i18n.t('order.msg.notEnough').toString(),
            progress: true,
            actions: [
              { label: root.$t('order.btn.cancel'), color: 'white' },
              {
                label: root.$t('order.btn.home'),
                color: 'accent',
                handler: () => {
                  void root.$router.push('/');
                },
              },
            ],
          });
          GTM.logEvent({
            category: 'Fail',
            action: 'pay-order',
            label: 'insufficient-balance',
            value: new Date().getTime(),
          });
          return;
        }
        useConfirmSend().value = true;
        const stop = watch(sending, (sending) => {
          if (!sending) {
            GTM.logEvent({
              category: 'Conversions',
              action: 'pay-order',
              label: sku.value?.name || '',
              value: Number(tokenAmount.value?.toString()),
            });
            root.$q
              .dialog({
                title: root.$t('order.label.success').toString(),
                message: root.$t('order.msg.paid').toString(),
                ok: {
                  flat: true,
                  label: root.$t('order.btn.checkOrders'),
                  noCaps: true,
                },
                cancel: {
                  color: 'grey',
                  flat: true,
                  label: root.$t('order.btn.cancel'),
                  noCaps: true,
                },
                persistent: true,
              })
              .onOk(() => {
                void root.$router.push('/shop/orders');
              });
            stop();
          }
        });
      }
    };

    return {
      showHeader: useConfig().showHeader,
      assets,
      selectedAsset,
      sku,
      placingOrder,
      amount,
      onPay,
      builder,
    };
  },
});

function loading(show = false) {
  show
    ? Loading.show({
        spinner: (QSpinnerBall as unknown) as Vue,
        spinnerColor: 'accent',
        spinnerSize: 64,
        messageColor: 'white',
        backgroundColor: 'primary',
      })
    : Loading.hide();
}
</script>
