export default class Redactable {
    private _value: string = $state('');
    private _redacted: boolean = $state(false);

    constructor(value: string, redacted: boolean = false) {
        this._value = value;
        this._redacted = redacted;
    }

    isRedacted() {
        return this._redacted;
    }

    redact() {
        this._redacted = true;
    }

    reveal() {
        this._redacted = false;
    }

    valueOf() {
        return this._redacted ? null : this._value;
    }

    toJSON() {
        return this.valueOf();
    }

    [Symbol.toPrimitive](_: string) {
        return this.valueOf();
    }
}
