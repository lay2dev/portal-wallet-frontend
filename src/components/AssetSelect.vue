<template>
  <div>
    <q-select
      v-model="selected"
      :options="assets"
      :dense="dense"
      borderless
      behavior="dialog"
      option-label="symbol"
      options-selected-class="selected-option"
    >
      <template v-if="selected" v-slot:prepend>
        <q-avatar square>
          <img :src="selected.icon" />
        </q-avatar>
      </template>
      <template v-slot:option="scope">
        <q-separator />
        <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
          <q-item-section avatar>
            <q-avatar square>
              <img :src="scope.opt.icon" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label v-html="scope.opt.symbol" />
            <q-item-label caption>{{ scope.opt.name }}</q-item-label>
          </q-item-section>
          <q-item-section class="text-caption" side>
            {{ `${displayBalance(scope.opt)} ${scope.opt.symbol}` }}
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@vue/composition-api';
import { Asset } from '../compositions/account';
export default defineComponent({
  name: 'AssetSelect',
  props: {
    dense: {
      type: Boolean,
    },
    asset: {
      type: (Object as unknown) as PropType<Asset>,
    },
    assets: {
      required: true,
      type: Array as PropType<Asset[]>,
    },
  },
  setup(props, { emit }) {
    const selected = computed({
      get: () => {
        return props.asset;
      },
      set: (val) => {
        emit('update:asset', val);
      },
    });

    const displayBalance = (asset: Asset) => {
      const balance = asset.sudt ? asset.sudtAmount : asset.capacity;
      return balance.toString(asset.decimals, { commify: true, fixed: 4 });
    };

    return {
      selected,
      displayBalance,
    };
  },
});
</script>

<style lang="scss" scoped>
.selected-option {
  background-color: $lime-1;
}
</style>