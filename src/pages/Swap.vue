<template>
  <q-page>
    <q-toolbar v-if="showHeader" class="bg-accent text-white">
      <q-btn flat size="sm" round icon="arrow_back_ios" to="/" replace />
      <q-toolbar-title class="text-center text-subtitle1 text-bold">{{
        $t('swap.title')
      }}</q-toolbar-title>
      <q-btn flat round icon="more_vert" class="invisible" />
    </q-toolbar>
    <div class="swap-wrapper q-pa-md">
      <q-card class="swap-card">
        <q-card-section class="q-py-sm relative-position">
          <div class="row justify-between">
            <q-select
              v-model="left"
              :options="lefts"
              :display-value="left.symbol"
              behavior="dialog"
              options-dense
              options-selected-class="text-bold bg-green-1"
              borderless
            >
              <template v-slot:prepend>
                <q-icon :name="left.icon" />
              </template>
              <template v-slot:option="scope">
                <q-separator />
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-avatar class="q-mr-sm" :icon="scope.opt.icon" />
                  <!-- <q-icon :name="scope.opt.icon" /> -->
                  <q-item-section>
                    <q-item-label v-html="scope.opt.symbol" />
                    <q-item-label caption
                      >{{ $t('swap.label.balance') }}:
                      {{
                        balancesLoading
                          ? $t('swap.label.loading')
                          : scope.opt.balance
                      }}</q-item-label
                    >
                  </q-item-section>
                  <q-item-section side>
                    <q-icon
                      v-if="left.symbol === scope.opt.symbol"
                      name="done"
                      color="primary"
                    />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-select
              v-model="right"
              :options="rights"
              :display-value="right.symbol"
              behavior="dialog"
              options-dense
              options-selected-class="text-bold bg-green-1"
              borderless
            >
              <template v-slot:prepend>
                <q-icon :name="right.icon" />
              </template>
              <template v-slot:option="scope">
                <q-separator />
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-avatar class="q-mr-sm" :icon="scope.opt.icon" />
                  <!-- <q-icon :name="scope.opt.icon" /> -->
                  <q-item-section>
                    <q-item-label v-html="scope.opt.symbol" />
                    <q-item-label caption
                      >{{ $t('swap.label.balance') }}:
                      {{ scope.opt.balance }}</q-item-label
                    >
                  </q-item-section>
                  <q-item-section side>
                    <q-icon
                      v-if="right.symbol === scope.opt.symbol"
                      name="done"
                      color="primary"
                    />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="row justify-between q-px-xs q-gutter-sm">
            <q-input
              class="col"
              v-model="leftAmount"
              input-class="text-bold"
              type="number"
              borderless
              :placeholder="$t('swap.label.sendAmount')"
            />
            <q-input
              class="col"
              input-class="text-right text-bold"
              v-model="rightAmount"
              type="number"
              borderless
              :placeholder="$t('swap.label.receiveAmount')"
            />
          </div>
          <q-avatar
            class="absolute-center"
            size="2.4em"
            color="grey-2"
            text-color="accent"
            icon="switch_left"
          />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="row justify-between">
            <div class="text-caption text-grey">
              {{ $t('swap.label.rate') }}({{ left.symbol }}/{{ right.symbol }}):
            </div>
            <div class="text-caption text-grey">
              {{ $t('swap.label.range') }}(CKB):
            </div>
          </div>
          <div class="row justify-between">
            <div class="text-caption">{{ rate }}</div>
            <div
              class="text-caption"
              :class="rightAmount && outOfRange && 'text-negative'"
            >
              {{ minimum }} - {{ maximum }}
            </div>
          </div>
        </q-card-section>
      </q-card>
      <q-btn
        class="full-width q-mx-sm q-mt-md"
        color="primary"
        icon="cached"
        :disable="outOfRange"
        :label="$t('swap.btn.swap')"
        @click="onSwap"
      />
    </div>
    <swap-tx-list class="q-mx-md" />
  </q-page>
</template>

<script lang="ts">
  import {
    defineComponent,
    ref,
    onMounted,
    computed,
    watch,
    Ref,
  } from '@vue/composition-api';
  import { useConfig } from '../compositions/config';
  import {
    swap,
    useSwap,
    loadSwapConfig,
    loadSwapRates,
    loadSwapBalances,
    useSwapBalancesLoading,
    loadSwapTxs,
  } from '../compositions/swap';
  import PWCore, { Amount } from '@lay2/pw-core';
  import SwapTxList from '../components/SwapTxList.vue';
  import { useAccount } from '../compositions/account';

  export default defineComponent({
    name: 'Swap',
    components: {
      SwapTxList,
    },
    setup() {
      const amount = ref(0);
      const minimum = ref(1000);
      const maximum = ref(100000);
      const inputSide = ref('');
      const inputAmount = ref('');
      const balance = useAccount().balance as Ref<Amount>;

      const { lefts, rights } = useSwap();

      const left = ref(lefts.value[0]);
      watch(lefts, () => {
        left.value = lefts.value[0];
      });
      const leftAmount = computed({
        get: () =>
          amount.value ? tofixed(amount.value / left.value.price, 6) : undefined,
        set: (val) => {
          inputSide.value = 'left';
          inputAmount.value = val || '';
          amount.value = Number(val) * left.value.price;
        },
      });

      const right = rights[0];
      right.balance = balance.value.toString(undefined, {
        commify: true,
        fixed: 4,
      });
      watch(balance, (balance) => {
        right.balance = balance.toString(undefined, { commify: true, fixed: 4 });
      });

      const rightAmount = computed({
        get: () =>
          amount.value ? tofixed(amount.value / right.price, 4) : undefined,
        set: (val) => {
          inputSide.value = 'right';
          inputAmount.value = val || '';
          amount.value = Number(val) * right.price;
        },
      });

      const rate = computed(
        () =>
          left.value.price && (left.value.price / (right.price || 1)).toFixed(4)
      );

      const outOfRange = computed(
        () => (rightAmount.value || 0) < 1000 || (rightAmount.value || 0) > 100000
      );
      watch(outOfRange, (val) => console.log('[Swap.vue] out of range', val));

      const onSwap = async () => {
        if (leftAmount.value && rightAmount.value) {
          await swap(left.value, leftAmount.value, rightAmount.value);
        }
      };

      onMounted(async () => {
        await loadSwapConfig();
        await loadSwapRates();
        PWCore.provider && (await loadSwapBalances(PWCore.provider.address));
      });

      watch(useAccount().address, (address) => {
        console.log('[Swap.vue] address changed', address);
        if (!!address) {
          void loadSwapBalances(address);
          void loadSwapTxs();
        }
      });

      watch(rate, () => {
        console.log('[Swap.vue] inputSide', inputSide.value);
        if (inputSide.value === 'left') {
          leftAmount.value = inputAmount.value;
        } else if (inputSide.value === 'right') {
          rightAmount.value = inputAmount.value;
        }
      });

      return {
        showHeader: useConfig().showHeader,
        openLeft: ref(false),
        balancesLoading: useSwapBalancesLoading(),
        lefts,
        left,
        leftAmount,
        rights,
        right,
        rightAmount,
        outOfRange,
        rate,
        minimum,
        maximum,
        onSwap,
      };
    },
    watch: {
      left() {
        this.leftAmount = '0';
      },
    },
  });

  const tofixed = (n: number, fixed: number) =>
    `${n}`.split('.')[1]?.length > fixed ? n.toFixed(fixed) : `${n}`;
</script>

<style lang="scss" scoped>
  .swap-wrapper {
    background: linear-gradient($accent, $accent 40%, $grey-2);
  }
</style>
