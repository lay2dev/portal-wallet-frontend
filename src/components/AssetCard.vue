<template>
  <q-card class="shadow-1 my-card cursor-pointer" @click="$emit('click')">
    <q-card-section class="row items-center">
      <div>
        <q-avatar size="36px">
          <img :src="asset.icon" />
        </q-avatar>
      </div>
      <div class="column q-mx-sm">
        <div class="text-subtitle text-bold">
          {{ asset.symbol }}
        </div>
        <div class="text-caption text-grey">{{ asset.name }}</div>
      </div>
      <div class="column col text-right">
        <div class="text-subtitle text-secondary text-bold">
          {{ formatedBalance }}
        </div>
        <div class="text-caption text-grey">{{ asset.decimals }}</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { AmountUnit } from '@lay2/pw-core';
import { computed, defineComponent, PropType } from '@vue/composition-api';
import { Asset } from 'src/compositions/account';
export default defineComponent({
  name: 'AssetCard',
  props: {
    asset: {
      required: true,
      type: (Object as unknown) as PropType<Asset>,
    },
  },
  setup(props) {
    const formatedBalance = computed(() => {
      if (props.asset.sudt) {
        return props.asset.sudtAmount.toString(props.asset.decimals, {
          fixed: 5,
          commify: true,
        });
      }
      return props.asset.capacity.toString(AmountUnit.ckb, {
        fixed: 4,
        commify: true,
      });
    });
    return {
      formatedBalance,
    };
  },
});
</script>

<style lang="scss" scoped>
.my-card {
  border-radius: 6px;
}
</style>
