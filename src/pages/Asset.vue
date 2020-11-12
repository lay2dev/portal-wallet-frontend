<template>
  <q-page>
    <q-toolbar v-if="showHeader" class="bg-accent text-white">
      <q-btn
        flat
        size="sm"
        round
        icon="arrow_back_ios"
        @click="$router.back()"
      />
      <q-toolbar-title class="text-center text-subtitle1 text-bold">{{
        $t('asset.title')
      }}</q-toolbar-title>
      <q-btn flat round icon="more_vert" class="invisible" />
    </q-toolbar>
    <div class="q-pa-sm">
      <q-card v-if="asset">
        <q-item class="q-pt-md">
          <q-item-section avatar class="q-pr-sm">
            <q-avatar size="md" square>
              <img :src="asset.icon" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-subtitle2">{{
              asset.symbol
            }}</q-item-label>
            <q-item-label caption> {{ asset.name }} </q-item-label>
          </q-item-section>
        </q-item>
        <q-card-section class="column q-py-xs">
          <div class="row col justify-end text-h6">
            {{ displayBalance(asset) }}
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="evenly" class="text-primary">
          <q-btn
            class="col"
            size="0.9em"
            dense
            flat
            no-caps
            icon="qr_code"
            to="swap"
            :label="$t('index.btn.receive')"
          />
          <q-separator spaced vertical />
          <q-btn
            class="col"
            size="0.9em"
            dense
            flat
            no-caps
            icon="send"
            :label="$t('index.btn.send')"
            @click="send(asset)"
          />
        </q-card-actions>
      </q-card>
      <div class="column col q-mt-sm">
        <q-card class="q-mb-xs no-shadow">
          <q-tabs
            v-model="filter.direction"
            no-caps
            inline-label
            indicator-color="accent"
            class="bg-white text-grey"
            active-color="accent"
            active-bg-color="grey-1"
          >
            <q-tab name="all" icon="swap_vert" :label="$t('send.label.all')" />
            <q-tab
              name="in"
              icon="arrow_downward"
              :label="$t('send.label.in')"
            />
            <q-tab
              name="out"
              icon="arrow_upward"
              :label="$t('send.label.out')"
            />
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
      </q-page-scroller>
    </div>
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';
import { Asset, useAssets, useTxFilter } from 'src/compositions/account';
import { useConfig } from 'src/compositions/config';
import TxList from '../components/TxList.vue';
export default defineComponent({
  name: 'Asset',
  components: { TxList },
  setup(props, { root }) {
    const assetId = Number.parseInt(root.$route.params.id);
    const assets = useAssets();
    const asset = computed(() => assets.value.find((a) => a.id === assetId));
    const filter = useTxFilter();

    const displayBalance = (asset: Asset) => {
      if (!asset) return '0';
      const balance = asset.sudt ? asset.sudtAmount : asset.capacity;
      return balance.toString(asset.decimals, { commify: true, fixed: 4 });
    };

    const send = (asset: Asset) => {
      void root.$router.push({
        name: 'Send',
        params: {
          id: `${asset.id}`,
        },
      });
    };

    return {
      showHeader: useConfig().showHeader,
      asset,
      displayBalance,
      filter,
      send,
    };
  },
});
</script>

<style lang="scss" scoped>
.q-item__section--avatar {
  min-width: 36px;
}
.filter-card {
  border-radius: 10%;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
</style>