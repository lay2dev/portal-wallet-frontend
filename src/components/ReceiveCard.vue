<template>
  <div>
    <q-card flat>
      <q-card-section class="column items-center q-pb-xs">
        <vue-qrcode :value="addresses[type]" :width="200" />
      </q-card-section>
      <q-card-section class="column items-center q-py-xs">
        <div class="text-caption text-grey">{{$t('receiveCard.label.address')}}</div>
        <div
          class="text-center text-subtitle2 q-px-lg"
          style="min-height: 3.5rem;word-break: break-word;line-height:1.3"
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
      <q-card-section class="column items-center q-py-xs">
        <div
          class="text-caption text-accent text-center q-pa-sm"
          style="min-height: 4rem;line-height: 1.3"
        >{{$t(`receiveCard.msg.${type}`)}}</div>
      </q-card-section>
      <q-separator spaced />
      <div class="text-center text-h6 q-mb-sm">{{$t('receiveCard.msg.where')}}</div>
      <q-tabs
        v-model="type"
        class="bg-grey-2 text-grey"
        active-bg-color="white"
        active-color="accent"
        no-caps
      >
        <q-tab name="default" :label="$t('receiveCard.label.native')" />
        <q-tab name="ckb" :label="$t('receiveCard.label.ckb')" />
        <q-tab name="portal" :label="$t('receiveCard.label.portal')" />
      </q-tabs>
    </q-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed } from '@vue/composition-api';
import { useAccount } from '../compositions/account';
import VueQrcode from 'vue-qrcode';
import { copyToClipboard, Notify } from 'quasar';
import { i18n } from '../boot/i18n';
export default defineComponent({
  name: 'ReceiveCard',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  components: { VueQrcode },
  setup() {
    const type: Ref<'default' | 'ckb' | 'portal'> = ref('default');
    const { address, portalAddress } = useAccount();
    const addresses = {
      default: computed(() => address.value?.addressString || '-'),
      ckb: computed(() => address.value?.toCKBAddress() || '-'),
      portal: computed(() => portalAddress.value || '-'),
    };

    const copy = async (content: string) => {
      await copyToClipboard(content);
      Notify.create({
        message: i18n.t('common.copied').toString(),
        type: 'positive',
        timeout: 2000,
      });
    };

    return { addresses, type, copy };
  },
});
</script>
