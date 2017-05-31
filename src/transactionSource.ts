import { createReadStream } from 'fs';
import { decodeStream } from 'iconv-lite';
import * as parseCsv  from 'csv-parse';
import { streamMap } from './utils';
import { Transaction } from './transaction';

type TransactionRecord = {
    date: string,
    operation_type: string,
    description: string,
    amount: string
}

const normalizeTransaction = (transactionRecord: TransactionRecord): Transaction => ({
    type: Transaction.Type.UNKNOWN,
    date: new Date(transactionRecord.date),
    description: transactionRecord.description,
    ISIN: '',
    amount: Number(transactionRecord.amount.replace(/,/, '.')),
    amountAsString: transactionRecord.amount.replace(/,/, '.')
});


export function createTransactionStream(filename: string): NodeJS.ReadWriteStream {
    const file = createReadStream(filename);
    const decode = decodeStream('win1250');
    const parse = parseCsv({
        delimiter: ';',
        columns: () => Array('date', 'operation_type', 'description', 'amount')
    });
    const normalize = streamMap(normalizeTransaction);

    return file.pipe(decode).pipe(parse).pipe(normalize);
}
