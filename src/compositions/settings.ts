import { reactive, watch, toRef } from '@vue/composition-api';
import { i18n } from 'src/boot/i18n';

const settings = reactive({
  locale: 'en-us',
  currency: 'usd',
  showBalance: true
});

export function useSettings() {
  return settings;
}

watch(toRef(settings, 'locale'), locale => {
  i18n.locale = locale;
});
