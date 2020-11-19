/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import axios from 'axios';
import {
  CollectorOptions,
  SUDTCollector,
  Cell,
  Address,
  Amount,
  AmountUnit,
  OutPoint,
  SUDT,
  Script,
  Transaction
} from '@lay2/pw-core';
import { LocalStorage } from 'quasar';

export class PWalletCell extends Cell {
  constructor(
    public readonly cellId: number,
    capacity: Amount,
    lock: Script,
    type?: Script,
    outPoint?: OutPoint,
    data?: string
  ) {
    super(capacity, lock, type, outPoint, data);
  }
}

export class PWalletCollector extends SUDTCollector {
  constructor(public apiBase: string) {
    super();
    this.apiBase = apiBase;
  }

  async getBalance(address: Address): Promise<Amount> {
    const res = await axios.get(
      `${
        this.apiBase
      }/cell/getCapacityByLockHash?lockHash=${address.toLockScript().toHash()}`
    );
    return new Amount(res.data.data, AmountUnit.shannon);
  }

  async collect(
    address: Address,
    options: CollectorOptions
  ): Promise<PWalletCell[]> {
    if (!options || !options.neededAmount) {
      throw new Error("'neededAmount' in options must be provided");
    }
    const cells: PWalletCell[] = [];
    const lock = address.toLockScript();
    const lockHash = lock.toHash();

    const lastCellId = PWalletCollector.getLastCellId(lockHash, '');
    const res = await axios.get(
      `${
        this.apiBase
      }/cell/unSpent?lockHash=${lockHash}&capacity=${options.neededAmount.toHexString()}&lastId=${lastCellId ||
        0}`
    );

    // eslint-disable-next-line prefer-const
    for (let { id, capacity, outPoint } of res.data.data) {
      capacity = new Amount(capacity, AmountUnit.shannon);
      outPoint = new OutPoint(outPoint.txHash, outPoint.index);
      cells.push(new PWalletCell(id, capacity, lock, undefined, outPoint));
    }

    return cells;
  }

  async getSUDTBalance(sudt: SUDT, address: Address): Promise<Amount> {
    const lockHash = address.toLockScript().toHash();
    const typeHash = sudt.toTypeScript().toHash();
    const res = await axios.get(
      `${this.apiBase}/sudt/balance?lockHash=${lockHash}&typeHash=${typeHash}`
    );
    return new Amount(res.data.data.sudtAmount, AmountUnit.shannon);
  }

  async collectSUDT(
    sudt: SUDT,
    address: Address,
    options: CollectorOptions
  ): Promise<PWalletCell[]> {
    if (!options || !options.neededAmount) {
      throw new Error("'neededAmount' in options must be provided");
    }
    const cells: PWalletCell[] = [];
    const lock = address.toLockScript();
    const lockHash = lock.toHash();
    const typeHash = sudt.toTypeScript().toHash();

    const lastCellId = PWalletCollector.getLastCellId(lockHash, typeHash);
    const res = await axios.get(
      `${
        this.apiBase
      }/cell/unSpent?lockHash=${lockHash}&capacity=0x0&typeHash=${typeHash}&sudtAmount=${options.neededAmount.toHexString()}&lastId=${lastCellId ||
        0}`
    );

    // eslint-disable-next-line prefer-const
    for (let { id, capacity, outPoint, type, data } of res.data.data) {
      capacity = new Amount(capacity, AmountUnit.shannon);
      outPoint = new OutPoint(outPoint.txHash, outPoint.index);
      cells.push(new PWalletCell(id, capacity, lock, type, outPoint, data));
    }

    return cells;
  }

  static notifyTxSuccess(address: Address, tx: Transaction, sudt?: SUDT) {
    if (!(tx.raw.inputCells[0] instanceof PWalletCell)) {
      return;
    }

    const cellIds = tx.raw.inputCells.map(x => (x as PWalletCell).cellId);
    const lastCellId = Math.max(...cellIds);

    let typeHash = '';
    if (sudt) {
      typeHash = sudt.toTypeScript().toHash();
    }
    this.setLastCellId(address.toLockScript().toHash(), typeHash, lastCellId);
  }

  static setLastCellId(lockHash: string, typeHash: string, value: number) {
    const key = `usedCellId_${lockHash}_${typeHash}`;

    const timestamp = new Date().getTime();
    const data = { timestamp, value };

    const item = LocalStorage.getItem(key) as {
      timestamp: number;
      value: number;
    };
    if (!item || !item.value || Number(item.value) < value) {
      LocalStorage.set(key, data);
    }
  }

  static getLastCellId(lockHash: string, typeHash: string) {
    const key = `usedCellId_${lockHash}_${typeHash}`;
    const item = LocalStorage.getItem(key) as {
      timestamp: number;
      value: number;
    };
    if (item && item.value) {
      const now = new Date().getTime();

      if (item.timestamp + 5 * 60 * 1000 > now) {
        return item.value.toString();
      }else{
        LocalStorage.remove(key);
      }
    }

    return '';
  }
}
