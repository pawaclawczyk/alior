export class Item { constructor(readonly name: string) {} }

export class Box {
    private items: Array<Item> = [];

    store(item: Item) { this.items.push(item); }

    *[Symbol.iterator]() {
        for (let i of this.items) {
            yield i;
        }
    }
}
