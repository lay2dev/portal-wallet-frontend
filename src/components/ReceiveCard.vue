<template>
  <div>
    <q-card flat>
      <q-card-section class="column items-center q-pa-none">
        <vue-qrcode :value="addresses[type]" :width="200" />
      </q-card-section>
      <q-card-section class="column items-center q-py-xs">
        <!-- <div class="text-caption text-grey">{{$t('receiveCard.label.address')}}</div> -->
        <div
          class="text-center text-bold q-px-lg q-mt-sm"
          style="font-size: 1.2em;word-break: break-word;line-height:1.3"
        >
          {{addresses[type]}}
          <q-btn
            color="grey"
            icon="content_copy"
            size="xs"
            round
            dense
            flat
            @click="copy(addresses[type])"
          />
        </div>
      </q-card-section>
      <q-card-section class="column items-center q-py-sm">
        <div
          class="text-caption text-accent text-center q-px-lg"
          style="min-height: 3.5rem;line-height: 1.5"
        >{{$t(`receiveCard.msg.${type}`)}}</div>
      </q-card-section>
      <q-separator spaced />
      <div
        class="text-center text-subtitle text-grey-6 text-bold q-my-sm"
      >- {{$t('receiveCard.msg.where')}} -</div>
      <q-tabs
        v-model="type"
        class="bg-white text-grey"
        align="justify"
        active-bg-color="accent"
        active-color="white"
        indicator-color="accent"
        no-caps
      >
        <q-tab name="default" :label="$t('receiveCard.label.native')" />
        <!-- <q-tab name="ckb" :label="$t('receiveCard.label.ckb')" /> -->
        <q-tab name="portal" :label="$t('receiveCard.label.portal')" />
      </q-tabs>
    </q-card>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  Ref,
  computed,
  onMounted,
} from '@vue/composition-api';
import { useAccount } from '../compositions/account';
import VueQrcode from 'vue-qrcode';
import { copy } from '../compositions/api';
import GTM from '../compositions/gtm';

export default defineComponent({
  name: 'ReceiveCard',
  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  components: { VueQrcode },
  setup() {
    const type: Ref<'default' | 'ckb' | 'portal'> = ref('default');
    const { address, portalAddress } = useAccount();
    const addresses = {
      default: computed(() => address.value?.addressString || '-'),
      ckb: computed(() => address.value?.toCKBAddress() || '-'),
      portal: computed(() => portalAddress.value || '-'),
    };

    onMounted(() => {
      GTM.logEvent({
        category: 'Actions',
        action: 'show-dialog',
        label: 'receive-card',
        value: new Date().getTime(),
      });
    });

    return { addresses, type, copy };
  },
});
</script>
