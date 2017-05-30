import { createReadStream } from "fs";
import {Transform} from "stream";
import * as parse from "csv-parse";
import {TransformOptions} from "stream";
import {Writable} from "stream";

type UnknownTransactionType = "";
type ShareTransactionType = "share";
type DividendTransactionType = "dividend";

type TransactionType = UnknownTransactionType | ShareTransactionType | DividendTransactionType

interface BaseTransaction {
    type: TransactionType;
    date: string;
    operation_type: string,
    description: string,
    amount: string
}

interface ShareTransaction extends BaseTransaction {
    type: ShareTransactionType;
    ZLC: string,
    NOT: string,
    ISIN: string
}

interface DividendTransaction extends BaseTransaction {
    type: DividendTransactionType,
    DP: string,
    ISIN: string,
}

type Transaction = BaseTransaction | ShareTransaction | DividendTransaction

const historyFile = __dirname + '/var/data/history.csv';

const history = createReadStream(historyFile);

const parser = parse({delimiter: ';', columns: () => ['date', 'operation_type', 'description', 'amount']});

const iconv = require("iconv").Iconv;
const toUtf8 = iconv('CP1250', 'UTF-8');

class RemoveDailySummary extends Transform {
    constructor(options: TransformOptions) {
        options.writableObjectMode = true;
        options.readableObjectMode = true;
        super(options);
    }

    _transform(chunk: BaseTransaction, encoding: string, callback: Function): void {
        if ("" !== chunk.operation_type) {
            this.push(chunk);
        }

        callback();
    }
}

class ShareTransactions extends Transform {
    constructor(options?: TransformOptions) {
        const _options = options || {};
        _options.writableObjectMode = true;
        _options.readableObjectMode = true;
        super(_options);
    }

    _transform(chunk: BaseTransaction, encoding: string, callback: Function): void {
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

class DividendTransactions extends Transform {
    constructor(options?: TransformOptions) {
        const _options = options || {};
        _options.writableObjectMode = true;
        _options.readableObjectMode = true;
        super(_options);
    }

    _transform(chunk: BaseTransaction, encoding: string, callback: Function): void {
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

class ConsoleWriter extends Writable {
    constructor() {
        super({objectMode: true});
    }

    _write(chunk: any, encoding: string, callback: Function): void {
        console.log(chunk);

        callback();
    }
}

class ToCollection extends Writable
{
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

const removeDailySummary = new RemoveDailySummary({});
const consoleWriter = new ConsoleWriter();
const transactionsCollector = new ToCollection();

const app = history
    .pipe(toUtf8)
    .pipe(parser)
    .pipe(removeDailySummary)
    .pipe(new ShareTransactions())
    .pipe(new DividendTransactions())
    .pipe(transactionsCollector)
    .on("finish", () => console.log(transactionsCollector._collection.filter((t: Transaction) => { if (t.type) { return false; } else { return true; } })))
;
