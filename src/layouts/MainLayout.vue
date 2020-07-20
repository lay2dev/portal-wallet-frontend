<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="bg-grey-2">
      <router-view />
      <q-dialog
        v-model="showLogin"
        persistent
      >
        <login-dialog />
      </q-dialog>
    </q-page-container>
  </q-layout>
</template>

<script>
  import { onMounted } from '@vue/composition-api';
  import init from '../compositions/init';
  import LoginDialog from '../components/LoginDialog.vue';
  import vConsole from 'vconsole';
  import { useShowLogin } from '../compositions/account';

  export default {
    name: 'MainLayout',
    components: { LoginDialog },
    created() {
      if (localStorage.getItem('vconsole') === 'on') new vConsole();
    },
    setup() {
      onMounted(async () => {
        await init();
      });

      return {
        showLogin: useShowLogin()
      };
    }
  };
</script>
