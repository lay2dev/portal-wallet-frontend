<template>
  <q-card flat class="dao-card">
    <q-card-section class="q-px-sm q-py-xs">
      <div class="row justify-between items-center" @click="gotoDao">
        <div class="row items-center">
          <q-avatar size="lg" icon="img:dao.svg" />
          <div class="q-ml-xs text-center text-subtitle">{{$t('daoCard.label.dao')}}</div>
        </div>
        <q-icon size="sm" color="grey-4" name="chevron_right" />
      </div>
    </q-card-section>
    <q-separator color="grey-2" />
    <q-card-section class="row justify-between items-center q-py-sm">
      <div class="q-ml-xs text-center text-subtitle">{{$t('daoCard.label.deposited')}}:</div>
      <div class="text-subtitle1 text-accent">{{lockedAmount}} CKB</div>
    </q-card-section>
    <q-separator color="grey-2" />
    <q-card-section class="q-pa-sm">
      <div class="row justify-evenly items-center">
        <div class="column items-start">
          <div class="text-caption text-accent">{{$t('daoCard.label.yesterday')}}:</div>
          <div class="text-caption text-bold text-primary">+ {{yesterdayAmount}} CKB</div>
        </div>
        <q-separator color="grey-2" spaced inset vertical />
        <div class="column items-start">
          <div class="text-caption text-accent">{{$t('daoCard.label.cumulative')}}:</div>
          <div class="text-caption text-bold text-primary">+ {{cumulativeAmount}} CKB</div>
        </div>
        <q-separator color="grey-2" spaced inset vertical />
        <div class="column items-start">
          <div class="text-caption text-accent">APC:</div>
          <div class="text-caption text-bold text-accent">{{apc}}</div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api';
import { openURL } from 'quasar';
import { useDao } from 'src/compositions/account';
import { AmountUnit } from '@lay2/pw-core';
import { useConfig } from '../compositions/config';
import { useSettings } from '../compositions/settings';

export default defineComponent({
  name: 'DaoCard',
  setup() {
    const { locked, yesterday, cumulative, apc } = useDao();

    const apcString = computed(() => `${apc.value}%`);
    const showBalance = computed(() => useSettings().showBalance);
    const lockedAmount = computed(() =>
      showBalance.value
        ? locked.value.toString(AmountUnit.ckb, {
            commify: true,
            section: 'integer',
          })
        : '****'
    );
    const yesterdayAmount = computed(() =>
      showBalance.value
        ? yesterday.value.toString(AmountUnit.ckb, { commify: true, fixed: 4 })
        : '****'
    );
    const cumulativeAmount = computed(() =>
      showBalance.value
        ? cumulative.value.toString(AmountUnit.ckb, { commify: true, fixed: 4 })
        : '****'
    );

    const gotoDao = () => openURL(useConfig().dao_url);

    return {
      apc: apcString,
      lockedAmount,
      yesterdayAmount,
      cumulativeAmount,
      gotoDao,
      showBalance,
    };
  },
});
</script>

<style lang="scss" scoped>
.dao-card {
  border-radius: 5px;
}
</style>