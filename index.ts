import { createReadStream } from "fs";
import { Transform, TransformOptions, Writable } from "stream";
import { decodeStream } from "iconv-lite";
import * as parse from "csv-parse";
import { createTransactionStream } from "./src/transactionSource";
import { markTransactions } from "./src/transaction";

// File with transactions from Alior -> Array<Transactions>
type TransactionType = "share" | "dividend"

interface Transaction {
    type: TransactionType;
    date: string;
    operation_type: string,
    description: string,
    amount: string
}

interface ShareTransaction extends Transaction {
    ZLC: string,
    NOT: string,
    ISIN: string
}

interface DividendTransaction extends Transaction {
    DP: string,
    ISIN: string,
}

const historyFile = __dirname + '/var/data/history.csv';
const history = createReadStream(historyFile);

const fixEncoding = decodeStream('win1250');

const parser = parse({
    delimiter: ';',
    columns: () => ['date', 'operation_type', 'description', 'amount']
});

abstract class ObjectTransform extends Transform {
    constructor(options?: TransformOptions) {
        options = options || {};
        options.writableObjectMode = true;
        options.readableObjectMode = true;
        super(options);
    }
}

class RemoveDailySummary extends ObjectTransform {
    _transform(chunk: Transaction, encoding: string, callback: Function): void {
        if ("" !== chunk.operation_type) {
            this.push(chunk);
        }

        callback();
    }
}

class ShareTransactions extends ObjectTransform {
    _transform(chunk: Transaction, encoding: string, callback: Function): void {
        const matches = chunk.description.match(/NOT: ([\d]+) ZLC: ([\d]+) PW: ([\w]+)/);

        if (null === matches) {
            this.push(chunk);

            return callback();
        }

        let [, NOT, ZLC, ISIN] = matches;

        const shareTransaction: ShareTransaction = {
            type: "share",
            date: chunk.date,
            operation_type: chunk.operation_type,
            description: chunk.description,
            amount: chunk.amount,
            NOT: NOT,
            ZLC: ZLC,
            ISIN: ISIN
        };

        this.push(shareTransaction);

        callback();
    }
}

class DividendTransactions extends ObjectTransform {
    _transform(chunk: Transaction, encoding: string, callback: Function): void {
        const matches = chunk.description.match(/DP: ([0-9\-]+) ([\w]{12})/);

        if (null === matches) {
            this.push(chunk);

            return callback();
        }

        let [, DP, ISIN] = matches;

        const dividendTransaction: DividendTransaction = {
            type: "dividend",
            date: chunk.date,
            operation_type: chunk.operation_type,
            description: chunk.description,
            amount: chunk.amount,
            DP: DP,
            ISIN: ISIN
        };

        this.push(dividendTransaction);

        callback();
    }
}

interface HashMap<T> {
    [key: string]: T;
}

type SecurityAggregate = {
    ISIN: string,
    transactions: Array<Transaction>
}

class AggregateByISIN extends ObjectTransform {
    private transactionsByISIN: HashMap<Array<Transaction>> = {};

    _transform(chunk: ShareTransaction | DividendTransaction, encoding: string, callback: Function): void {
        const key = chunk.type ? chunk.ISIN : '';

        if (this.transactionsByISIN[key]) {
            this.transactionsByISIN[key].push(chunk);
        } else {
            this.transactionsByISIN[key] = [chunk];
        }

        callback();
    }

    _flush(done : Function) : void {

        for (const key in this.transactionsByISIN) {
            const securityAggregate : SecurityAggregate = {
                ISIN: key,
                transactions: this.transactionsByISIN[key]
            };

            this.push(securityAggregate);
        }

        done();
    }
}

class ReduceToProfits extends ObjectTransform {
    _transform(securityAggregate: SecurityAggregate, encoding: string, done: Function): void {

        const profit = securityAggregate.transactions.reduce((acc: number, v: Transaction): number => { return acc + Number(v.amount.replace(/,/, '.')) }, 0);

        this.push({
            ISIN: securityAggregate.ISIN,
            profit: profit
        });

        done();
    }
}

class ConsoleWriter extends Writable {
    constructor() {
        super({objectMode: true});
    }

    _write(chunk: any, encoding: string, callback: Function): void {
        console.log(chunk);

        callback();
    }
}

class ToCollection extends Writable {
    readonly _collection: Array<any>;

    constructor() {
        super({objectMode: true});
        this._collection = [];
    }

    _write(chunk: any, encoding: string, callback: Function): void {
        this._collection.push(chunk);

        callback();
    }
}

const transactionsCollector = new ToCollection();

// const app = history
//     .pipe(fixEncoding)
//     .pipe(parser)
//     .pipe(new RemoveDailySummary())
//     .pipe(new ShareTransactions())
//     .pipe(new DividendTransactions())
//     .pipe(new AggregateByISIN())
//     .pipe(new ReduceToProfits());
// ;

// app.pipe(new ConsoleWriter());
// app.pipe(transactionsCollector).on("finish", () => console.log('First element' + transactionsCollector._collection[0].description));

const app = createTransactionStream(historyFile).pipe(markTransactions).pipe(new ConsoleWriter());