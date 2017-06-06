import { createReadStream } from "fs";
import { Writable } from "stream";
import { createTransactionStream } from "./src/transactionSource";
import {
    markBondTransactions, markStockTransactions, removeUnknownTransactions,
    markRonsonDividendTransactions, groupTransactionsByISIN, sumSecuritiesValue
} from "./src/transaction";

const historyFile = __dirname + '/var/data/history.csv';
const history = createReadStream(historyFile);

class ConsoleWriter extends Writable {
    constructor() {
        super({objectMode: true});
    }

    _write(chunk: any, encoding: string, callback: Function): void {
        console.log(chunk);

        callback();
    }
}

const app = createTransactionStream(historyFile)
    .pipe(markBondTransactions)
    .pipe(markStockTransactions)
    .pipe(markRonsonDividendTransactions)
    .pipe(removeUnknownTransactions)
    .pipe(groupTransactionsByISIN)
    .pipe(sumSecuritiesValue)
    .pipe(new ConsoleWriter());
