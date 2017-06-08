import { createTransactionStream } from "./src/transactionSource";
import { markTransactions, profitPerSecurity } from "./src/transaction";
import { ConsoleWriter } from "./src/utils";
import {Nothing, Maybe, Just} from "./src/maybe";
import {Box, Item} from "./src/iterators";

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

let box = new Box();

box.store(new Item('Jabłko'));
box.store(new Item('Żółw'));
box.store(new Item('Książka'));

for (let i of box) {
    console.log(i.name);
}

let prefix = 'Prefix';
let placeholder = '"this is a placeholder"';
let someText = () => 'some text';

function otherText() {
    return 'other text';
}

let text = tag `${prefix} ${ someText } Use a placeholder here ${ placeholder } ${ otherText }`;

function tag(literals: any, ...placeholders: Array<any>) {
    console.log(literals);
    console.log(placeholders);

    let result = '';

    for (let index = 0; index < placeholders.length; index++) {
        result += literals[index] + placeholders[index];
    }

    result += literals[placeholders.length];

    return result;
}

console.log(text);

interface A { a: string }
interface B { b: string }

function ext(a: A, b: B): A & B {
    return {...a, ...b};
}

ext({ a: 'AAA' }, { b: 'BBB' });

let tuple = ['1', 2];

let [a, b] = tuple;

console.log(typeof a);
console.log(typeof b);