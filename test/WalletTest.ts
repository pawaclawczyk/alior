import {DividendPayout, TaxForDividendPayout} from "../src/Transaction";
import {Wallet} from "../src/Wallet";
import {expect} from 'chai';

describe('A wallet', () => {
    const t1 = new DividendPayout(new Date('23-03-2017'), 'Wypłata dywidendy RONSON EUROPE, kwota netto, podatek 15%.', 38.25);
    const t2 = new DividendPayout(new Date('05-05-2017'), 'Dywidenda: DP: 2017-04-12 PLMCSFT00018 (MCLOGIC);', 81.25);
    const t3 = new TaxForDividendPayout(new Date('05-05-2017'), 'Podatek od dywidendy: DP: 2017-04-12 PLMCSFT00018 (MCLOGIC);', -15);

    const wallet = new Wallet(Array(t1, t2, t3));

    it('contains dividend payouts after tax payment', () => {
        expect(wallet.dividend()).to.be.equal(104.5)
    });
});
