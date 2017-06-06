import { Transform, TransformOptions } from "stream";

class ObjectTransform extends Transform {
    constructor(opts?: TransformOptions) {
        const options = opts || {};
        options.readableObjectMode = true;
        options.writableObjectMode = true;
        super(options);
    }
}

class FilterTransform extends ObjectTransform {
    constructor(private p: Function, opts?: TransformOptions) {
        super(opts);
    }

    _transform(chunk: any, encoding: string, callback: Function): void {
        if (this.p(chunk)) {
            this.push(chunk, encoding);
        }

        callback();
    }
}

class MapTransform extends ObjectTransform {
    constructor(private f: Function, opts?: TransformOptions) {
        super(opts);
    };

    _transform(chunk: any, encoding: string, callback: Function): void {
        this.push(this.f(chunk));
        callback();
    }
}

class ReduceTransform extends ObjectTransform {
    constructor(private r: Function, private z: any, private opts?: TransformOptions) {
        super(opts);
    }

    _transform(chunk: any, encoding: string, callback: Function): void {
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

export const streamMap = (f: Function) => new MapTransform(f);
export const streamFilter = (p: Function) => new FilterTransform(p);
export const streamReduce = <T>(r: Function, z: T) => new ReduceTransform(r, z);
