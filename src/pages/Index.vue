<template>
  <q-page class="column justify-start q-pb-sm">
    <q-toolbar class="bg-accent text-white">
      <q-btn
        flat
        round
        dense
        icon="subject"
      />
      <q-space />
      <q-btn
        flat
        round
        dense
        icon="add"
      >
        <q-menu>
          <q-list>
            <q-item
              clickable
              v-close-popup
            >
              <div class="row items-center">
                <q-avatar
                  size="lg"
                  icon="crop_free"
                />
                {{$t('index.btn.scan')}}
              </div>
            </q-item>
            <q-separator />
            <q-item
              clickable
              v-close-popup
            >
              <div class="row items-center">
                <q-avatar
                  size="lg"
                  icon="settings"
                />
                {{$t('index.btn.settings')}}
              </div>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-toolbar>
    <div class="row bg-accent items-center q-px-md q-py-sm">
      <q-item class="col text-white">
        <q-item-section
          top
          avatar
        >
          <jazzicon
            :address="lockHash"
            :diameter="48"
            :shape-count="5"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-bold">{{originAddress}}</q-item-label>
          <q-item-label
            caption
            class="text-warning"
          >{{ckbAddress}}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row">
            <q-btn
              color="white"
              round
              flat
              icon="qr_code"
              @click="showReceive = true"
            />
            <q-btn
              :color="authorized ? 'primary' : 'white'"
              round
              flat
              icon="login"
              @click="authorized ? logout() : showLogin = true"
            />
          </div>
        </q-item-section>
      </q-item>
    </div>
    <div class="row meta q-px-md q-py-xs">
      <q-card
        class="col bg-grey-1 balance-card"
        v-touch-hold:2000="toggleVConsole"
      >
        <q-card-section class="relative-position">
          <div class="text-h6 text-accent">{{balance}} CKB</div>
          <div class="text-subtitle2 text-grey-8">{{fiatSymbol}} {{fiat}}</div>
          <q-btn
            class="absolute-right q-mr-md"
            color="accent"
            round
            flat
            :icon="showBalance ? 'visibility' : 'visibility_off'"
            @click="showBalance = !showBalance"
          />
        </q-card-section>
        <q-card-actions
          align="evenly"
          class="bg-accent text-white q-px-xs q-py-sm"
        >
          <q-btn
            flat
            dense
            no-caps
            icon="cached"
            :label="$t('index.btn.swap')"
            to="swap"
          />
          <q-separator
            inset
            vertical
            dark
          />
          <q-btn
            flat
            dense
            no-caps
            icon="get_app"
            :label="$t('index.btn.receive')"
            @click="showReceive = true"
          />
          <q-separator
            inset
            vertical
            dark
          />
          <q-btn
            flat
            dense
            no-caps
            icon="sync_alt"
            :label="$t('index.btn.send')"
            to="send"
          />
        </q-card-actions>
      </q-card>
    </div>
    <div
      v-if="showTxList"
      class="column q-px-md q-my-xs"
    >
      <q-card flat>
        <tx-list
          :size="3"
          :more="false"
        />
      </q-card>
    </div>
    <div class="row q-px-md q-my-xs">
      <dao-card class="col" />
    </div>
    <div class="row q-px-md q-my-xs">
      <q-card
        flat
        class="col"
      >
        <q-card-section>
          PW Shop Widget
        </q-card-section>
      </q-card>
    </div>
    <q-page-scroller
      position="bottom-right"
      :scroll-offset="150"
      :offset="[18, 32]"
    >
      <q-btn
        fab
        icon="keyboard_arrow_up"
        color="accent"
      />
    </q-page-scroller>

    <q-dialog
      v-model="showReceive"
      position="top"
    >
      <receive-card class="col" />
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
  import Vue from 'vue';
  import {
    useAccount,
    useTxRecords,
    truncatedAddress,
    useAuthorized,
    useShowLogin,
    logout
  } from 'src/compositions/account';
  import { AmountUnit, Amount } from '@lay2/pw-core';
  import { Notify } from 'quasar';
  import { ref, computed } from '@vue/composition-api';
  import Jazzicon from 'vue-jazzicon';
  import TxList from 'src/components/TxList.vue';
  import ReceiveCard from 'src/components/ReceiveCard.vue';
  import DaoCard from 'src/components/DaoCard.vue';
  import { useSwap } from '../compositions/swap';
  import { useConfig, useFiatSymbol } from '../compositions/config';

  export default Vue.extend({
    name: 'PageIndex',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    components: { Jazzicon, TxList, ReceiveCard, DaoCard },
    setup() {
      const { address } = useAccount();
      const showBalance = computed({
        get: () => useConfig().showBalance,
        set: val => (useConfig().showBalance = val)
      });
      const originAddress = computed(() =>
        truncatedAddress(address.value?.addressString)
      );
      const ckbAddress = computed(() =>
        truncatedAddress(address.value?.toCKBAddress(), 21)
      );
      const lockHash = computed(() => address.value?.toLockScript().toHash());
      const balance = computed(() =>
        showBalance.value
          ? useAccount().balance.value.toString(AmountUnit.ckb, {
              commify: true,
              fixed: 4
            })
          : '****'
      );
      const fiatSymbol = useFiatSymbol();
      const fiat = computed(() =>
        showBalance.value
          ? useAccount()
              .balance.value.mul(new Amount(useSwap().rights[0].price.toString()))
              .toString(AmountUnit.ckb, { commify: true, fixed: 2 })
          : '****'
      );

      const showTxList = computed(() => useTxRecords().txs.value.length);
      const showReceive = ref(false);

      return {
        originAddress,
        ckbAddress,
        lockHash,
        showReceive,
        balance,
        fiat,
        fiatSymbol,
        showBalance,
        showTxList,
        showLogin: useShowLogin(),
        toggleVConsole: toggleVConsole,
        authorized: useAuthorized(),
        logout: logout
      };
    }
  });

  function toggleVConsole() {
    let vConsole = localStorage.getItem('vconsole') || '';
    vConsole = vConsole === 'on' ? 'off' : 'on';

    Notify.create({
      message: `vConsole will be switched ${vConsole}`,
      position: 'top',
      actions: [
        {
          label: 'Cancel',
          color: 'white'
        },
        {
          label: 'OK, Reload',
          color: 'primary',
          handler: () => {
            localStorage.setItem('vconsole', vConsole);
            window.location.reload();
          }
        }
      ]
    });
  }
</script>

<style lang="scss" scoped>
  .meta {
    // background: linear-gradient(to bottom, $accent 50%, transparent 50%);
    background: linear-gradient($accent 30%, transparent);
  }
  .balance-card {
    border-radius: 10px;
  }
</style>