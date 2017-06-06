import { createReadStream } from "fs";
import { Writable } from "stream";
import { createTransactionStream } from "./src/transactionSource";
import {markTransactions, mbt, mst} from "./src/transaction";

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

const app = createTransactionStream(historyFile).pipe(mbt).pipe(mst).pipe(new ConsoleWriter());
// const app = createTransactionStream(historyFile).pipe(markTransactions).pipe(new ConsoleWriter());
