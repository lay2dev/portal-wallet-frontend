<template>
  <q-page class="column justify-start q-pb-sm">
    <q-drawer
      side="left"
      v-model="showDrawer"
      :width="240"
      :breakpoint="600"
      elevated
      overlay
      content-class="bg-accent text-grey-2"
    >
      <q-scroll-area class="fit">
        <q-btn
          flat
          v-if="showNetworkSwitch"
          color="primary"
          label="Switch Network"
          @click="showSwitchNetwork"
        />
        <div class="text-h6 q-pa-md">{{$t('index.label.settings')}}</div>
        <div class="q-pa-sm">
          <q-list v-for="(menuItem, index) in menuList" :key="index">
            <q-item clickable v-ripple @click="onMenuClicked(menuItem)">
              <q-item-section avatar>
                <q-icon :name="menuItem.icon" />
              </q-item-section>
              <q-item-section>{{ menuItem.label }}</q-item-section>
            </q-item>
            <q-separator dark class="q-my-sm" v-if="menuItem.separator" />
          </q-list>
        </div>
      </q-scroll-area>
    </q-drawer>
    <div class="row bg-accent items-center q-pa-sm q-pl-xs">
      <q-item class="col text-white">
        <q-item-section top avatar>
          <jazzicon :address="lockHash" :diameter="48" :shape-count="5" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-bold">{{originAddress}}</q-item-label>
          <q-item-label caption class="text-warning">{{ckbAddress}}</q-item-label>
        </q-item-section>
        <q-btn
          class="absolute-top-right"
          flat
          round
          dense
          icon="subject"
          @click="showDrawer = !showDrawer"
        />
      </q-item>
    </div>
    <div class="row meta q-px-md q-py-xs">
      <q-card class="col bg-grey-1 balance-card" v-touch-hold:2000="toggleVConsole">
        <q-card-section class="relative-position">
          <div
            class="text-h6 text-accent"
          >{{accountLoading ? $t('index.label.loading') : balance}} CKB</div>
          <div
            class="text-subtitle2 text-grey-8"
          >{{fiatSymbol}} {{accountLoading ? $t('index.label.loading') : fiat}}</div>
          <q-btn
            class="absolute-right q-mr-md"
            color="accent"
            :ripple="false"
            round
            flat
            :icon="showBalance ? 'visibility' : 'visibility_off'"
            @click="showBalance = !showBalance"
          />
        </q-card-section>
        <q-card-actions align="evenly" class="bg-accent text-white q-px-xs q-py-sm">
          <q-btn flat dense no-caps icon="cached" :label="$t('index.btn.swap')" to="swap" />
          <q-separator inset vertical dark />
          <q-btn
            flat
            dense
            no-caps
            icon="qr_code"
            :label="$t('index.btn.receive')"
            @click="showReceive = true"
          />
          <q-separator inset vertical dark />
          <q-btn flat dense no-caps icon="send" :label="$t('index.btn.send')" to="send" />
        </q-card-actions>
      </q-card>
    </div>
    <div v-if="showTxList" class="column q-px-md q-my-xs">
      <q-card flat>
        <tx-list :size="1" direction="all" :more="false" />
      </q-card>
    </div>
    <div class="row q-px-md q-my-xs">
      <dao-card class="col" />
    </div>
    <div class="row q-px-md q-my-xs">
      <q-card flat class="col">
        <shop-card />
      </q-card>
    </div>
    <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="[18, 32]">
      <q-btn fab icon="keyboard_arrow_up" color="accent" />
    </q-page-scroller>

    <q-dialog v-model="showReceive" position="top">
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
  logout,
} from 'src/compositions/account';
import { AmountUnit, Amount } from '@lay2/pw-core';
import { Notify, LocalStorage, openURL } from 'quasar';
import { ref, computed, onMounted, watch } from '@vue/composition-api';
import Jazzicon from 'vue-jazzicon';
import TxList from 'src/components/TxList.vue';
import ReceiveCard from 'src/components/ReceiveCard.vue';
import DaoCard from 'src/components/DaoCard.vue';
import ShopCard from 'src/components/ShopCard.vue';
import { useSwap, useFiatRates } from '../compositions/swap';
import { useFiatSymbol, switchNetwork } from '../compositions/config';
import { useSettings } from '../compositions/settings';
import GTM from '../compositions/gtm';

export default Vue.extend({
  name: 'PageIndex',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  components: { Jazzicon, TxList, ReceiveCard, DaoCard, ShopCard },
  setup(props, { root }) {
    const locale = ref<string | undefined>();
    const showDrawer = ref(false);
    const menuList = ref<MenuItem[]>([]);

    const { address } = useAccount();
    const accountLoading = useAccount().loading;
    const showBalance = computed({
      get: () => useSettings().showBalance,
      set: (val) => (useSettings().showBalance = val),
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
            fixed: 4,
          })
        : '****'
    );
    const fiatSymbol = useFiatSymbol();
    const fiatPrice = computed(() =>
      useFiatRates()[useSettings().currency].toString()
    );
    const fiat = computed(() =>
      showBalance.value
        ? useAccount()
            .balance.value.mul(
              new Amount(useSwap().rights[0].price.toString()).mul(
                new Amount(fiatPrice.value)
              )
            )
            .toString(AmountUnit.ckb, { commify: true, fixed: 2 })
        : '****'
    );

    const showTxList = computed(() => useTxRecords().txs.value.length);
    const showReceive = ref(false);

    onMounted(() => {
      locale.value = useSettings().locale;
    });

    watch(showDrawer, (show) => {
      if (show) {
        menuList.value = loadMenuList();
      }
    });

    const onMenuClicked = (menuItem: MenuItem) => {
      GTM.logEvent({
        category: 'Actions',
        action: 'click-menu',
        label: menuItem.name,
        value: new Date().getTime(),
      });
      switch (menuItem.name) {
        case 'contacts':
          void root.$router.push('contacts');
          break;
        case 'language':
          chooseLanguage();
          break;
        case 'currency':
          chooseCurrency();
          break;
        case 'support':
          openURL('https://portalwallet.zendesk.com');
          break;
        case 'aboutus':
          openURL('https://ckb.pw/about-us');
          break;
      }
    };

    const chooseLanguage = () => {
      root.$q
        .dialog({
          title: root.$t('index.label.language').toString(),
          color: 'accent',
          options: {
            type: 'radio',
            model: useSettings().locale,
            items: [
              { label: '中文', value: 'zh-cn', color: 'accent' },
              { label: 'English', value: 'en-us', color: 'accent' },
            ],
          },
          cancel: true,
          persistent: true,
        })
        .onOk((data: string) => {
          useSettings().locale = data;
          showDrawer.value = false;
        });
    };

    const chooseCurrency = () => {
      root.$q
        .dialog({
          title: root.$t('index.label.fiatSymbol').toString(),
          color: 'accent',
          options: {
            type: 'radio',
            model: useSettings().currency,
            items: [
              { label: 'USD', value: 'usd', color: 'accent' },
              { label: 'CNY', value: 'cny', color: 'accent' },
            ],
          },
          cancel: true,
          persistent: true,
        })
        .onOk((data: string) => {
          useSettings().currency = data;
          showDrawer.value = false;
        });
    };

    const showSwitchNetwork = () => {
      root.$q
        .dialog({
          title: 'Switch Network',
          options: {
            type: 'radio',
            model: LocalStorage.getItem<string>('network') || 'main',
            items: [
              { label: 'Mainnet', value: 'main' },
              { label: 'Testnet', value: 'test', color: 'accent' },
              { label: 'Lay2net', value: 'lay2', color: 'orange' },
            ],
          },
          cancel: true,
          persistent: true,
        })
        .onOk((data: string) => {
          switchNetwork(data);
        });
    };

    const loadMenuList = (): MenuItem[] => [
      {
        name: 'contacts',
        icon: 'contacts',
        label: root.$t('index.btn.contacts').toString(),
        separator: true,
      },
      {
        name: 'language',
        icon: 'language',
        label: root.$t('index.btn.language').toString(),
        separator: false,
      },
      {
        name: 'currency',
        icon: 'attach_money',
        label: root.$t('index.btn.currency').toString(),
        separator: true,
      },
      {
        name: 'support',
        icon: 'help',
        label: root.$t('index.btn.support').toString(),
        separator: false,
      },
      {
        name: 'aboutus',
        icon: 'home',
        label: root.$t('index.btn.aboutus').toString(),
        separator: false,
      },
    ];

    return {
      accountLoading,
      originAddress,
      ckbAddress,
      lockHash,
      showReceive,
      balance,
      fiat,
      fiatSymbol,
      locale,
      menuList,
      showBalance,
      showTxList,
      showDrawer,
      showNetworkSwitch: process.env.RC,
      showSwitchNetwork,
      showLogin: useShowLogin(),
      toggleVConsole: toggleVConsole,
      authorized: useAuthorized(),
      onMenuClicked,
      logout: logout,
    };
  },
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
        color: 'white',
      },
      {
        label: 'OK, Reload',
        color: 'primary',
        handler: () => {
          localStorage.setItem('vconsole', vConsole);
          window.location.reload();
        },
      },
    ],
  });
}

interface MenuItem {
  name: string;
  icon: string;
  label: string;
  separator: boolean;
}
</script>

<style lang="scss" scoped>
.meta {
  background: linear-gradient($accent 30%, transparent);
}
.balance-card {
  border-radius: 10px;
}
</style>