import { createTransactionStream } from "./src/transactionSource";
import { markTransactions, profitPerSecurity } from "./src/transaction";
import { ConsoleWriter } from "./src/utils";
import {Nothing, Maybe, Just} from "./src/maybe";

const historyFile = __dirname + '/var/data/history.csv';

const transactionInput = createTransactionStream(historyFile);
const transactions = markTransactions(transactionInput);
const profits = profitPerSecurity(transactions);

profits.pipe(new ConsoleWriter());

console.log(Nothing);
console.log(new Just(5));
console.log(Nothing instanceof Maybe);
console.log(new Just(5) instanceof Maybe);
console.log(typeof Nothing);
console.log(typeof new Just(5));
