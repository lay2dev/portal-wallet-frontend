<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="bg-grey-1">
      <router-view class="bg-grey-2" style="max-width: 600px; margin: 0 auto" />
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
import { useShowLogin, useAccount } from '../compositions/account';
import { useConfirmSend, send } from '../compositions/send';
import { Loading, QSpinnerBall, Notify, openURL } from 'quasar';
import { i18n } from '../boot/i18n';
import { useShowCardinfo } from '../compositions/shop/order';
import { useSettings, loadSettings } from '../compositions/settings';
import { loadConfig, useConfig } from '../compositions/config';

export default defineComponent({
  name: 'MainLayout',
  components: { LoginDialog, SignBoard, CardInfo },
  created() {
    if (localStorage.getItem('vconsole') === 'on') new vConsole();
    if (process.env.PROD && !process.env.RC)
      console.log = () => {
        return 0;
      };
    loadConfig();
  },
  setup(props, { root }) {
    onMounted(async () => {
      useSettings().locale = root.$q.lang.getLocale() || 'en-us';
      loadSettings();
      await init();

      if (useConfig().platform === 'MyKey') {
        root.$q
          .dialog({
            title: root.$t('index.label.caution').toString(),
            message: root.$t('index.msg.mykey').toString(),
            persistent: true,
            ok: {
              label: root.$t('index.btn.mykey'),
              color: 'negative',
            },
          })
          .onOk(() => {
            useAccount().address.value = undefined;
            useAccount().portalAddress.value = undefined;
          });
        return;
      }

      if (process.env.RC) {
        showRCNotice();
      }
    });

    const showRCNotice = () => {
      root.$q
        .dialog({
          title: root.$t('index.label.caution').toString(),
          message: root.$t('index.msg.rc').toString(),
          ok: {
            label: root.$t('index.btn.gotoOfficial'),
            color: 'positive',
          },
          cancel: {
            label: root.$t('index.btn.understood'),
            color: 'grey',
          },
        })
        .onOk(() => {
          openURL('https://ckb.pw');
        });
    };

    const onSend = async () => {
      loading(true);
      const txHash = await send();
      if (txHash) {
        console.log('sent: ', txHash);
        useConfirmSend().value = false;
        notify('send.msg.sent', 'positive');
      }
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
