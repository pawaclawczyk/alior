import { Transform, TransformOptions } from "stream";

class ObjectTransform extends Transform {
    constructor(opts?: TransformOptions) {
        const options = opts || {};
        options.readableObjectMode = true;
        options.writableObjectMode = true;
        super(options);
    }
}

class MapTransform extends ObjectTransform {
    private f : Function;
    constructor(f: Function, opts?: TransformOptions) {
        super(opts);
        this.f = f;
    };

    _transform(chunk: any, encoding: string, callback: Function): void {
        this.push(this.f(chunk));
        callback();
    }
}

export const streamMap = (f: Function) => new MapTransform(f);
