// Mocks all files ending in `.vue` showing them as plain Vue instances
declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

interface ImToken {
  callAPI: (string, unknown) => void;
  callPromisifyAPI: (string) => Promise<known>;
}
interface Window {
  web3: any;
  ethereum: any;
  imToken: ImToken;
  dataLayer: any;
}

declare module 'vue-qrcode';
declare module 'ethjs-unit';
declare module 'vue-jazzicon';
