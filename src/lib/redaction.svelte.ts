import uuid4 from 'uuid4';

/**
 * Class to represent a value that can be redacted.
 *
 * Redacted values serialize into `null`, while non-redacted ones are a string.
 */
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

/**
 * Convert a list of strings into `Redactable`s.
 */
export function redact(...values: string[]) {
    return values.map(value => new Redactable(value, isSecret(value)));
}

/**
 * Attempts to determine whether the value seems like it might be a secret.
 * The checks are naive – only a best guess.
 */
function isSecret(value: string): boolean {
    return (
        uuid4.valid(value) ||
        /^[A-Fa-f0-9]{8,}$/.test(value) ||
        value.length > 24 ||
        value.includes('PRIVATE KEY')
    );
}
