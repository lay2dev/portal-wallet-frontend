// Mocks all files ending in `.vue` showing them as plain Vue instances
declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

interface Window {
  web3: any;
  ethereum: any;
  imToken: any;
}

declare module 'vue-qrcode';
declare module 'ethjs-unit';
declare module 'vue-jazzicon';
