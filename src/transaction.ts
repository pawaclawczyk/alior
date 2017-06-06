import { streamMap } from './utils';

export type Transaction = {
    type: string
    date: Date
    description: string,
    ISIN: string
    amount: number,
    amountAsString: string
}

export const Transaction = {
    Type: {
        UNKNOWN: 'UNKNOWN',
        STOCKS: 'STOCKS',
        BONDS: 'BONDS',
    }
};

const stocksTransactionMatcher = /NOT: ([\d]+) ZLC: ([\d]+) PW: ([\w]+)/;

const markStockTransaction = (t: Transaction): Transaction => {
    const matches = t.description.match(stocksTransactionMatcher);

    if (null !== matches) {
        const [, , , ISIN] = matches;

        return {
            type: Transaction.Type.STOCKS,
            date: t.date,
            description: t.description,
            ISIN: ISIN,
            amount: t.amount,
            amountAsString: t.amountAsString
        };
    }

    return t;
};

const bondsTransactionMatcher = /DP: ([0-9\-]+) ([\w]{12})/;

const markBondTransaction = (t: Transaction): Transaction => {
    const matches = t.description.match(bondsTransactionMatcher);

    if (null !== matches) {
        const [, , ISIN] = matches;

        t.type = Transaction.Type.BONDS;
        t.ISIN = ISIN
    }

    return t;
};

export const mbt = streamMap(markBondTransaction);
export const mst = streamMap(markStockTransaction);

export const markTransactions = mbt.pipe(mst);
