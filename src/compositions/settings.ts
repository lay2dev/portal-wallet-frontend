import { reactive, watch, toRef } from '@vue/composition-api';
import { i18n } from 'src/boot/i18n';
import { LocalStorage } from 'quasar';

interface Settings extends Record<string, unknown> {
  locale: string;
  currency: string;
  showBalance: boolean;
}

const settings = reactive<Settings>({
  locale: 'en-us',
  currency: 'usd',
  showBalance: true
});

export function loadSettings() {
  const localSettings = LocalStorage.getItem<Settings>('settings') || settings;
  for (const key in settings) {
    settings[key] = localSettings[key];
  }
}

export function useSettings() {
  return settings;
}

watch(settings, settings => {
  LocalStorage.set('settings', settings);
});

watch(toRef(settings, 'locale'), locale => {
  i18n.locale = locale;
});
