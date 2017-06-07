import { createTransactionStream } from "./src/transactionSource";
import { markTransactions, profitPerSecurity } from "./src/transaction";
import { ConsoleWriter } from "./src/utils";

const historyFile = __dirname + '/var/data/history.csv';

const transactionInput = createTransactionStream(historyFile);
const transactions = markTransactions(transactionInput);
const profits = profitPerSecurity(transactions);

profits.pipe(new ConsoleWriter());
