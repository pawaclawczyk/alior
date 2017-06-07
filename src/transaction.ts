import {streamMap, streamFilter, streamReduce, HashMap} from './utils';
import ReadableStream = NodeJS.ReadableStream;

export type Transaction = {
    type: string
    date: Date
    description: string,
    ISIN: string
    amount: number,
    amountAsString: string
}

type SecurityValue = {
    ISIN: string,
    value: number
}
type TransactionList = Array<Transaction>
type GroupedTransactions = HashMap<TransactionList>

export const Transaction = {
    Type: {
        UNKNOWN: 'UNKNOWN',
        STOCKS: 'STOCKS',
        BONDS: 'BONDS',
    }
};

const stocksTransactionMatcher = /NOT: ([\d]+) ZLC: ([\d]+) PW: ([\w]+)/;

const markStock = (t: Transaction): Transaction => {
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

const markBond = (t: Transaction): Transaction => {
    const matches = t.description.match(bondsTransactionMatcher);

    if (null !== matches) {
        const [, , ISIN] = matches;

        t.type = Transaction.Type.BONDS;
        t.ISIN = ISIN
    }

    return t;
};

const markRonsonDividend = (t: Transaction) => {
    if ('Wypłata dywidendy RONSON EUROPE, kwota netto, podatek 15%.' === t.description) {
        t.type = Transaction.Type.STOCKS;
        t.ISIN = 'NL0006106007';
    }

    return t;
};

const hasKnownType = (t: Transaction): boolean => {
    return t.type !== Transaction.Type.UNKNOWN;
};

const groupByISIN = (t: Transaction, z: GroupedTransactions): GroupedTransactions => {
    if (!z.hasOwnProperty(t.ISIN)) {
        z[t.ISIN] = Array();
    }

    z[t.ISIN].push(t);

    return z;
};

const sumAmounts = (ts: TransactionList): SecurityValue => {
    return ts.reduce(
        (acc: SecurityValue, t: Transaction): SecurityValue => ({
            ISIN: t.ISIN,
            value: acc.value + t.amount
        }),
        {ISIN: '', value: 0}
    );
};

export function markTransactions(input: NodeJS.ReadableStream): NodeJS.ReadableStream {
    return input
        .pipe(streamMap(markBond))
        .pipe(streamMap(markStock))
        .pipe(streamMap(markRonsonDividend))
}

export function profitPerSecurity(input: NodeJS.ReadableStream): NodeJS.ReadableStream {
    return input
        .pipe(streamFilter(hasKnownType))
        .pipe(streamReduce(groupByISIN, {}))
        .pipe(streamMap(sumAmounts))
}
