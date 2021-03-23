<template>
  <q-page class="column justify-start">
    <div class="bg-accent column col">
      <q-drawer
        side="left"
        v-model="showDrawer"
        :width="240"
        :breakpoint="600"
        elevated
        overlay
        content-class="bg-secondary text-grey-2"
      >
        <q-scroll-area class="fit">
          <q-btn
            flat
            v-if="showNetworkSwitch"
            color="white"
            label="Switch Network"
            @click="showSwitchNetwork"
          />
          <div class="text-h6 q-pa-md">{{ $t('index.label.settings') }}</div>
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
      <div class="meta q-pt-sm q-px-md">
        <div class="row justify-between">
          <q-item
            class="text-amber q-px-none"
            clickable
            @click="showReceive = true"
          >
            <q-item-section top avatar>
              <div class="row items-center">
                <jazzicon
                  class="row items-center"
                  :address="lockHash"
                  :diameter="28"
                  :shape-count="5"
                />
                <q-item-label class="q-ml-sm text-bold">{{
                  originAddress
                }}</q-item-label>
                <q-btn
                  color="amber"
                  icon="qr_code"
                  size="sm"
                  dense
                  flat
                  @click="showReceive = true"
                />
              </div>
            </q-item-section>
            <q-item-section>
              <!-- <q-item-label caption class="text-warning">{{ckbAddress}}</q-item-label> -->
            </q-item-section>
          </q-item>
          <q-btn
            flat
            color="white"
            round
            dense
            icon="subject"
            @click="showDrawer = !showDrawer"
          />
        </div>
        <q-card
          class="bg-grey-1 balance-card"
          v-touch-hold:2000="toggleVConsole"
        >
          <div class="relative-position">
            <!-- <div
            class="text-h6 text-dark text-right"
          >{{accountLoading ? $t('index.label.loading') : balance}} CKB</div> -->
            <div class="row justify-between items-center q-px-md q-py-sm">
              <div class="text-h6 text-accent">
                {{ fiatSymbol }}
                {{ accountLoading ? $t('index.label.loading') : fiat }}
              </div>
              <q-btn
                color="accent"
                :ripple="false"
                round
                flat
                :icon="showBalance ? 'visibility' : 'visibility_off'"
                @click="showBalance = !showBalance"
              />
            </div>
          </div>
          <q-card-actions align="evenly" class="bg-primary text-white">
            <q-btn
              class="col"
              size="0.9em"
              dense
              flat
              no-caps
              icon="cached"
              @click="gotoSwap"
              :label="$t('index.btn.swap')"
            />
            <q-separator spaced inset vertical dark />
            <q-btn
              class="col"
              size="0.9em"
              dense
              flat
              no-caps
              icon="send"
              to="send"
              :label="$t('index.btn.send')"
            />
          </q-card-actions>
        </q-card>
        <div class="col q-px-md q-pt-md">
          <q-tabs
            v-model="tab"
            class="index-tab text-grey"
            indicator-color="primary"
            active-color="white"
            no-caps
            dense
            align="justify"
          >
            <q-tab
              name="assets"
              :label="$t('index.label.assets')"
              content-class=""
            />
            <q-tab name="utilities" :label="$t('index.label.utilities')" />
          </q-tabs>
        </div>
      </div>
      <q-card class="panel-card col" flat>
        <q-tab-panels
          v-model="tab"
          class="q-my-sm bg-transparent"
          swipeable
          animated
        >
          <q-tab-panel name="assets">
            <asset-card
              v-for="(asset, index) in assets"
              :key="index"
              :asset="asset"
              class="q-mb-sm"
              @click="gotoAsset(asset)"
            />
          </q-tab-panel>
          <q-tab-panel name="utilities">
            <div class="row">
              <dao-card class="col" />
            </div>
            <div class="row q-my-sm">
              <shop-card class="col" />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
    <q-page-scroller
      position="bottom-right"
      :scroll-offset="150"
      :offset="[18, 32]"
    >
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
    useAssets,
    Asset,
  } from 'src/compositions/account';
  import { AmountUnit, Amount } from '@lay2/pw-core';
  import { Notify, LocalStorage } from 'quasar';
  import { ref, computed, onMounted, watch } from '@vue/composition-api';
  import Jazzicon from 'vue-jazzicon';
  import ReceiveCard from 'src/components/ReceiveCard.vue';
  import AssetCard from 'src/components/AssetCard.vue';
  import DaoCard from 'src/components/DaoCard.vue';
  import ShopCard from 'src/components/ShopCard.vue';
  import { useSwap, useFiatRates } from '../compositions/swap';
  import {
    useFiatSymbol,
    switchNetwork,
    useConfig,
  } from '../compositions/config';
  import { useSettings } from '../compositions/settings';
  import GTM from '../compositions/gtm';

  export default Vue.extend({
    name: 'PageIndex',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    components: { Jazzicon, ReceiveCard, AssetCard, DaoCard, ShopCard },
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
        truncatedAddress(address.value?.addressString, 22)
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
      const fiat = computed(() => {
        let balance = Amount.ZERO;
        if (assets.value && assets.value.length) {
          balance = assets.value
            .filter((x) => x.symbol === 'CKB' || x.symbol === 'DAO')
            .map((a) => a.capacity)
            .reduce((a, b) => a.add(b));
          balance = new Amount(
            `${(
              Number(balance.toString()) *
              useSwap().rights[0].price *
              Number(fiatPrice.value)
            ).toFixed(2)}`
          );
        }
        return showBalance.value
          ? balance.toString(AmountUnit.ckb, { commify: true, fixed: 2 })
          : '****';
      });

      const assets = useAssets();

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
            let url = 'https://notion.so/lay2/';
            if (useSettings().locale === 'zh-cn') {
              url += '618970231b8b4466aacc45e2a082ab88';
            } else {
              url += 'User-manual-5dcdf86af6e140fab9ee68f73bed8935';
            }
            openURL(url);
            break;
          case 'aboutus':
            openURL('https://ckb.pw/about-us');
            break;
        }
      };

      const gotoAsset = (asset: Asset) => {
        if (asset.id === 0) {
          // Nervos DAO
          openURL(useConfig().dao_url);
        } else if (asset.id === 999999) {
          // Unknown
          return;
        } else {
          void root.$router.push(`asset/${asset.id}`);
        }
      };

      const gotoSwap = () => {
        let url = 'https://notion.so/lay2/';
        if (useSettings().locale === 'zh-cn') {
          url += 'Portal-Wallet-4e60d6f266e44bdbaeaf91b4f722836d';
        } else {
          url +=
            'About-closing-the-SWAP-function-in-Portal-Wallet-293adfd40fe448639b93b060de3a008d';
        }
        openURL(url);
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
        assets,
        originAddress,
        ckbAddress,
        lockHash,
        showReceive,
        balance,
        fiat,
        fiatSymbol,
        tab: ref('assets'),
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
        gotoAsset,
        gotoSwap,
      };
    },
  });

  function openURL(url: string) {
    window.location.href = url;
  }

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

<style lang="scss">
  .index-tab .q-tab__indicator {
    height: 6px;
  }
</style>
<style lang="scss" scoped>
  .meta {
    background: linear-gradient($secondary 50%, $accent);
  }
  .balance-card {
    border-radius: 6px;
  }
  .panel-card {
    border-radius: 0px;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    background: #eee;
  }
</style>
