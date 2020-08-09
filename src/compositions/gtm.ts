/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { uid } from 'quasar';

export interface GTMEvent {
  category: string;
  action: string;
  label: string;
  value: number;
}

export default {
  logEvent(e: GTMEvent) {
    const { category, action, label, value } = e;
    window.dataLayer.push({
      event: 'customEvent',
      category: category,
      action: action,
      label: label,
      value: value,
      cid: this.getCid()
    });
    console.log('[GTM Event]', e);
  },

  logPage(path: any) {
    // Here you can preprocess the path, if needed
    window.dataLayer.push({
      event: 'customPageView',
      path: path,
      cid: this.getCid()
    });
  },

  getCid() {
    // We need an unique identifier for this session
    // We store it in a localStorage, but you may use cookies, too
    if (!localStorage.cid) {
      localStorage.cid = uid();
    }
    return localStorage.cid;
  }
};
