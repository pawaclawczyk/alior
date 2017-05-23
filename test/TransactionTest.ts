import {
    DividendPayout, TransactionType, Transaction, Income, Outcome,
    TaxForDividendPayout
} from "../src/Transaction";
import {expect, use} from 'chai';
import chaiDateTime = require("chai-datetime");

use(chaiDateTime);

describe('A transaction', () => {
    let transaction: Transaction;

    beforeEach(() => {
        transaction = new Transaction(
            new Date('2017-05-23 20:23:00'),
            Income,
            'Dywidenda: DP: 2017-04-12 PLMCSFT00018 (MCLOGIC);',
            81.25
        );
    });

    it('has a transaction date', () => {
       it('has date of transaction', () => {
           expect(transaction.date).to.be.instanceOf(Date);
       });
    });

    it('has a transaction type', () => {
        expect(transaction.type).to.be.instanceOf(TransactionType);
    });

    it('has a description', () => {
        expect(transaction.desc).to.be.a('string');
    });

    it('has an amount', () => {
        expect(transaction.amount).to.be.a('number');
    });
});

describe('A dividend payout', () => {
    let transaction: DividendPayout;

    beforeEach(() => {
         transaction = new DividendPayout(
            new Date('2017-05-23 20:23:00'),
            'Dywidenda: DP: 2017-04-12 PLMCSFT00018 (MCLOGIC);',
            81.25
        );
    });

    it('is a transaction', () => {
        expect(transaction).to.be.instanceOf(Transaction);
    });

    it('is an income', () => {
        expect(transaction.type).to.be.equal(Income);
    })
});

describe('A tax for dividend payout', () => {
    let transaction: DividendPayout;

    beforeEach(() => {
        transaction = new TaxForDividendPayout(
            new Date('2017-05-23 20:23:00'),
            'Dywidenda: DP: 2017-04-12 PLMCSFT00018 (MCLOGIC);',
            81.25
        );
    });

    it('is a transaction', () => {
        expect(transaction).to.be.instanceOf(Transaction);
    });

    it('is an outcome', () => {
        expect(transaction.type).to.be.equal(Outcome);
    })
});
