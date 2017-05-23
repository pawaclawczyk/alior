import {Transaction, DividendPayout, TaxForDividendPayout} from "./Transaction";

export class Wallet {
    constructor(private transactions: Array<Transaction>) {}

    dividend(): Number {
        return this.transactions
            .filter((t: Transaction) => t instanceof DividendPayout || t instanceof TaxForDividendPayout)
            .map((t: Transaction) => t.amount)
            .reduce((t1: Number, t2: Number) => Number(t1.valueOf() + t2.valueOf()));
    }
}
