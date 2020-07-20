import { reactive, toRefs } from '@vue/composition-api';
import PWCore, {
  Address,
  EthProvider,
  PwCollector,
  ChainID,
  CHAIN_SPECS
} from '@lay2/pw-core';

interface Init {
  pw: PWCore | undefined;
  address: Address | undefined;
}

const state = reactive<Init>({
  pw: undefined,
  address: undefined
});

const ethProvider = new EthProvider((newAddress: Address) => {
  state.address = newAddress;
});

export default async function init() {
  state.pw = await new PWCore('https://lay2.ckb.dev').init(
    ethProvider,
    new PwCollector('https://cellapi.ckb.pw'),
    ChainID.ckb_dev,
    CHAIN_SPECS.Lay2
  );
  state.address = PWCore.provider.address;
}

export function useInit() {
  return toRefs(state);
}
