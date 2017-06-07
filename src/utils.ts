import { Transform, TransformOptions, Writable } from "stream";

export type HashMap<T> = { [k: string]: T }

export class ConsoleWriter extends Writable {
    constructor() {
        super({objectMode: true});
    }

    _write(chunk: any, encoding: string, callback: Function): void {
        console.log(chunk);

        callback();
    }
}

export type Mapper<T, U> = (x: T) => U
export type Filter<T> = (x: T) => boolean
export type Reducer<T, U> = (x: T, z: U) => U

class ObjectTransform extends Transform {
    constructor(opts?: TransformOptions) {
        const options = opts || {};
        options.readableObjectMode = true;
        options.writableObjectMode = true;
        super(options);
    }
}

class FilterTransform<T> extends ObjectTransform {
    constructor(private p: Filter<T>, opts?: TransformOptions) {
        super(opts);
    }

    _transform(chunk: T, encoding: string, callback: Function): void {
        if (this.p(chunk)) {
            this.push(chunk, encoding);
        }

        callback();
    }
}

class MapTransform<T, U> extends ObjectTransform {
    constructor(private f: Mapper<T, U>, opts?: TransformOptions) {
        super(opts);
    };

    _transform(chunk: T, encoding: string, callback: Function): void {
        this.push(this.f(chunk));
        callback();
    }
}

class ReduceTransform<T, U> extends ObjectTransform {
    constructor(private r: Reducer<T, U>, private z: U, private opts?: TransformOptions) {
        super(opts);
    }

    _transform(chunk: T, encoding: string, callback: Function): void {
        this.z = this.r(chunk, this.z);
        callback();
    }

    _flush(done: Function): void {
        for (let k in this.z) {
            this.push(this.z[k]);
        }

        done();
    }
}

export const streamMap = <T, U>(f: Mapper<T, U>) => new MapTransform(f);
export const streamFilter = <T>(p: Filter<T>) => new FilterTransform(p);
export const streamReduce = <T, U>(r: Reducer<T, U>, z: U) => new ReduceTransform(r, z);
