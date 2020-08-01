<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <router-view />
      <q-dialog v-model="showLogin" persistent>
        <login-dialog />
      </q-dialog>
      <q-dialog v-model="confirmSend" persistent position="bottom">
        <q-card>
          <sign-board @send="onSend" />
        </q-card>
      </q-dialog>
      <q-dialog v-model="showCardInfo" position="bottom">
        <card-info />
      </q-dialog>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { onMounted, defineComponent } from '@vue/composition-api';
import init from '../compositions/init';
import LoginDialog from '../components/LoginDialog.vue';
import SignBoard from '../components/SignBoard.vue';
import CardInfo from '../components/CardInfo.vue';
import vConsole from 'vconsole';
import { useShowLogin } from '../compositions/account';
import { useConfirmSend, send } from '../compositions/send';
import { Loading, QSpinnerBall, Notify } from 'quasar';
import { i18n } from '../boot/i18n';
import { useShowCardinfo } from '../compositions/shop/order';
import { useSettings } from '../compositions/settings';

export default defineComponent({
  name: 'MainLayout',
  components: { LoginDialog, SignBoard, CardInfo },
  created() {
    if (localStorage.getItem('vconsole') === 'on') new vConsole();
  },
  setup(props, { root }) {
    onMounted(async () => {
      useSettings().locale = root.$q.lang.getLocale() || 'en-us';
      await init();
    });

    const onSend = async () => {
      loading(true);
      const txHash = await send();
      if (txHash) {
        console.log('sent: ', txHash);
        useConfirmSend().value = false;
      }
      notify('send.msg.sent', 'positive');
      loading(false);
    };

    return {
      showLogin: useShowLogin(),
      confirmSend: useConfirmSend(),
      showCardInfo: useShowCardinfo(),
      onSend,
    };
  },
});

function loading(show = false) {
  show
    ? Loading.show({
        spinner: (QSpinnerBall as unknown) as Vue,
        spinnerColor: 'accent',
        spinnerSize: 64,
        messageColor: 'white',
        backgroundColor: 'primary',
      })
    : Loading.hide();
}

function notify(i18nMsg: string, type: string) {
  Notify.create({
    type,
    message: i18n.t(i18nMsg).toString(),
    timeout: 3000,
    position: 'bottom',
  });
}
</script>
