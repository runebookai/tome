export class Result<T> {
    public constructor(public readonly _value: T | Error) {}

    get value() {
        if (this.isOk()) {
            return this._value;
        }
    }

    get error() {
        if (this.isErr()) {
            return this._value;
        }
    }

    isOk(): boolean {
        return !this.isErr();
    }

    isErr(): boolean {
        return this._value instanceof Error;
    }

    unwrap() {
        if (this.isOk()) {
            return this._value;
        } else {
            throw new Error('Called unwrap on an error: ' + this._value);
        }
    }

    unwrapOr(defaultValue: T): T {
        return this.isOk() ? (this._value as T) : defaultValue;
    }

    unwrapOrElse(fn: (err: Error) => T): T {
        return this.isOk() ? (this._value as T) : fn(this.error as Error);
    }
}
