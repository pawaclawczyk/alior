export class TransactionType { constructor(private type: String) {} }
export const Income: TransactionType = new TransactionType('Income');
export const Outcome: TransactionType = new TransactionType('Outcome');

export class Transaction {
    constructor(public date: Date, public type: TransactionType, public desc: String, public amount: Number) {}
}

export class DividendPayout extends Transaction {
    constructor(date: Date, desc: String, amount: Number) {
        super(date, Income, desc, amount);
    }
}

export class TaxForDividendPayout extends Transaction {
    constructor(date: Date, desc: String, amount: Number) {
        super(date, Outcome, desc, amount);
    }
}
