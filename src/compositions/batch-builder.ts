import PWCore, {
  Builder,
  Transaction,
  Cell,
  Amount,
  AmountUnit,
  RawTransaction,
  Address
} from '@lay2/pw-core';
import { Pair } from './send';

export class BatchBuilder extends Builder {
  constructor(public receivePairs: Pair[], feeRate?: number) {
    super(feeRate);
  }

  async build(fee: Amount = Amount.ZERO): Promise<Transaction> {
    let neededAmount = Builder.MIN_CHANGE.add(fee);

    const outputCells: Cell[] = [];
    for (const pair of this.receivePairs) {
      // if (!pair.isValidPair())
      //   throw new Error('Invalid receive pair: ' + JSON.stringify(pair));
      outputCells.push(
        new Cell(pair.amount, (pair.address as Address).toLockScript())
      );
      neededAmount = neededAmount.add(pair.amount);
    }

    let inputSum = Amount.ZERO;
    const inputCells: Cell[] = [];

    // fill the inputs
    const cells = await this.collector.collect(PWCore.provider.address, {
      neededAmount
    });
    for (const cell of cells) {
      inputCells.push(cell);
      inputSum = inputSum.add(cell.capacity);
      if (inputSum.gt(neededAmount)) break;
    }

    if (inputSum.lt(neededAmount)) {
      throw new Error(
        `input capacity not enough, need ${neededAmount.toString(
          AmountUnit.ckb
        )}, got ${inputSum.toString(AmountUnit.ckb)}`
      );
    }

    const changeCell = new Cell(
      inputSum.sub(neededAmount.sub(Builder.MIN_CHANGE)),
      PWCore.provider.address.toLockScript()
    );

    const tx = new Transaction(
      new RawTransaction(inputCells, [...outputCells, changeCell]),
      [Builder.WITNESS_ARGS.Secp256k1]
    );

    this.fee = Builder.calcFee(tx);

    if (changeCell.capacity.gte(Builder.MIN_CHANGE.add(this.fee))) {
      changeCell.capacity = changeCell.capacity.sub(this.fee);
      tx.raw.outputs.pop();
      tx.raw.outputs.push(changeCell);
      return tx;
    }

    return this.build(this.fee);
  }
}
