<template>
  <q-card class="my-card">
    <q-card-section class="row items-center q-gutter-sm">
      <div>
        <q-avatar size="36px">
          <img :src="asset.icon" />
        </q-avatar>
      </div>
      <div class="column">
        <div class="text-subtitle text-bold">{{asset.symbol}}</div>
        <div class="text-caption text-grey">{{asset.id}}</div>
      </div>
      <div class="column col text-right">
        <div class="text-subtitle text-bold">{{asset.balance}}</div>
        <div class="text-caption text-grey">{{asset.price}}</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api';
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
    return {};
  },
});
</script>
