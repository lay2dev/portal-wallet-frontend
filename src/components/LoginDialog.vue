<template>
  <div>
    <q-card>
      <div class="q-py-xs">
        <q-toolbar>
          <q-avatar
            square
            size="md"
          >
            <img src="favicon.ico">
          </q-avatar>
          <q-toolbar-title class="text-center">{{$t('login.title')}}</q-toolbar-title>
          <q-btn
            flat
            round
            dense
            icon="close"
            v-close-popup
          />
        </q-toolbar>
      </div>
      <q-card-section class="bg-green-1 inset-shadow">
        <center class="q-mb-md text-h6 text-accent">{{$t('login.msg.hint')}}</center>
        <span>{{$t('login.msg.detail')}}</span>
      </q-card-section>
      <q-card-section>
        <q-btn
          class="full-width"
          size="1.2em"
          rounded
          :loading="waiting"
          :disable="waiting"
          color="primary"
          icon="login"
          no-caps
          :label="$t('login.btn.login')"
          @click="onLogin"
        >
          <template v-slot:loading>
            <q-spinner-facebook color="white" />
          </template>
        </q-btn>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from '@vue/composition-api';
  import { login } from '../compositions/account';
  export default defineComponent({
    name: 'LoginDialog',
    setup() {
      const waiting = ref(false);
      const onLogin = async () => {
        waiting.value = true;
        await login();
        waiting.value = false;
      };

      return { onLogin, waiting };
    },
  });
</script>
