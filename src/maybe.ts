const NothingSymbol = Symbol('Nothing');
const JustSymbol = Symbol('Just');

export abstract class Maybe<T> {
    static [Symbol.hasInstance](other: any) {
        return other[JustSymbol] || other[NothingSymbol];
    }

    static [Symbol.toStringTag]() {
        return 'Maybe';
    }

    abstract map<U>(f: (x: T) => U): Maybe<U>;
}

export class Just<T> implements Maybe<T> {
    [key: string]: any

    static [Symbol.toStringTag]() {
        return 'Maybe';
    }

    constructor(private value: T) {
        this[JustSymbol] = true;
    }

    map<U>(f: (x: T) => U): Maybe<U> { return new Just(f(this.value)) }
}

export const Nothing = new (class Nothing implements Maybe<any> {
    [key: string]: any

    static [Symbol.toStringTag]() {
        return 'Maybe';
    }

    constructor() {
        this[NothingSymbol] = true;
    }

    map<U>(f: (x: any)=>U): Nothing {
        return this;
    }
});
