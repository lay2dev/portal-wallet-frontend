import { reactive } from '@vue/composition-api';

const settings = reactive({
  locale: 'en-us',
  currency: 'usd',
  showBalance: true
});

export function useSettings() {
  return settings;
}
