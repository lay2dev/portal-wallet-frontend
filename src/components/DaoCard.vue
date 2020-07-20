<template>
  <q-card
    flat
    class="dao-card"
  >
    <q-card-section>
      <div class="row justify-between items-center">
        <div class="row items-center">
          <q-avatar
            size="lg"
            color="primary"
            text-color="white"
            icon="foundation"
          />
          <div class="col-6 q-ml-xs text-center text-dark">{{$t('daoCard.label.balance')}}: </div>
        </div>
        <div class="text-subtitle1 text-bold text-accent">{{lockedAmount}} CKB</div>
      </div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="row justify-between items-center">
        <div class="column items-start">
          <div class="text-caption text-accent">{{$t('daoCard.label.yesterday')}}: </div>
          <div class="text-caption text-bold text-primary">+ {{yesterdayAmount}} CKB</div>
        </div>
        <q-separator
          spaced
          inset
          vertical
        />
        <div class="column items-start">
          <div class="text-caption text-accent">{{$t('daoCard.label.cumulative')}}: </div>
          <div class="text-caption text-bold text-primary">+ {{cumulativeAmount}} CKB</div>
        </div>
        <q-separator
          spaced
          inset
          vertical
        />
        <q-btn
          color="grey"
          flat
          no-caps
          icon-right="chevron_right"
          @click="gotoDao"
        />
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

  export default defineComponent({
    name: 'DaoCard',
    setup() {
      const { locked, yesterday, cumulative } = useDao();

      const showBalance = computed(() => useConfig().showBalance);
      const lockedAmount = computed(() =>
        showBalance.value
          ? locked.value.toString(AmountUnit.ckb, {
              commify: true,
              section: 'whole'
            })
          : '****'
      );
      const yesterdayAmount = computed(() =>
        showBalance.value
          ? yesterday.value.toString(AmountUnit.ckb, { commify: true, fixed: 5 })
          : '****'
      );
      const cumulativeAmount = computed(() =>
        showBalance.value
          ? cumulative.value.toString(AmountUnit.ckb, { commify: true, fixed: 5 })
          : '****'
      );

      const gotoDao = () => openURL(useConfig().dao_url);

      return {
        lockedAmount,
        yesterdayAmount,
        cumulativeAmount,
        gotoDao,
        showBalance
      };
    }
  });
</script>

<style lang="scss" scoped>
  .dao-card {
    border-radius: 5px;
  }
</style>