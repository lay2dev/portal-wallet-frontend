<template>
  <div>
    <q-card flat>
      <q-card-section class="column items-center">
        <vue-qrcode
          :value="addresses[type]"
          :width="200"
        />
      </q-card-section>
      <q-card-section class="column items-center">
        <div class="text-caption text-grey">{{$t('receiveCard.label.address')}}</div>
        <div
          class="text-center q-px-lg"
          style="min-height: 4rem;word-break: break-word"
        >{{addresses[type]}}</div>
      </q-card-section>
      <q-tabs
        v-model="type"
        class="bg-grey-2 text-grey"
        active-bg-color="white"
        active-color="accent"
      >
        <q-tab
          name="native"
          :label="$t('receiveCard.label.native')"
        />
        <q-tab
          name="ckb"
          :label="$t('receiveCard.label.ckb')"
        />
        <q-tab
          name="portal"
          :label="$t('receiveCard.label.portal')"
        />
      </q-tabs>
    </q-card>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, Ref, computed } from '@vue/composition-api';
  import { useAccount } from '../compositions/account';
  import VueQrcode from 'vue-qrcode';
  export default defineComponent({
    name: 'ReceiveCard',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    components: { VueQrcode },
    setup() {
      const type: Ref<'native' | 'ckb' | 'portal'> = ref('native');
      const { address } = useAccount();
      const addresses = {
        native: computed(() => address.value?.addressString || '-'),
        ckb: computed(() => address.value?.toCKBAddress() || '-'),
        portal: computed(() => address.value?.toCKBAddress() || '-')
      };

      return { addresses, type };
    }
  });
</script>
