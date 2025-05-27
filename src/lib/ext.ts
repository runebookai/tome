/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Javascript stdlib extensions
 *
 * This file should only include functions added to standard Javascript
 * objects. Each function needs a cooresponding type definition in
 * `src/app.d.ts`.
 */

/**
 * Return the Object without k/v pairs where the value is explicitly undefined.
 *
 * Typically you'll use this after mapping a bunch of values where some may be
 * undefined.
 *
 * @example
 * ```ts
 * const compacted = Object.compact({ a: 1, b: true, c: undefined });
 * assertEq(compacted, { a: 1, b: true });
 * ```
 */
Object.compact = function <T>(o: Obj): T {
    return Object.fromEntries(Object.entries(o).filter(([_, v]) => v !== undefined)) as T;
};

/**
 * Return the Object without specific k/v pairs, specified by key.
 *
 * @example
 * ```ts
 * const subobj = Object.without({a: 1, b: 2}, ['b']);
 * assertEq(subobj, {a: 1})
 * ```
 */
Object.without = function <T>(o: Obj, keys: string[]): T {
    return Object.fromEntries(Object.entries(o).filter(([k, _]) => !keys.includes(k))) as T;
};

/**
 * Remove, and return, a value by key
 *
 * @example
 * ```ts
 * const value = Object.remove({a: 1, b: 2}, 'b');
 * assertEq(value, 2);
 * ```
 */
Object.remove = function <T>(o: Obj, key: string): T | undefined {
    if (Object.hasOwn(o, key)) {
        const value = o[key];
        delete o[key];
        return value;
    }
};

/**
 * Map over the entries of an object
 */
Object.map = function <T extends Obj>(o: T, fn: (key: string, value: any) => any): T {
    return Object.fromEntries(Object.entries(o).map(([k, v]) => fn(k, v))) as T;
};

/**
 * Sort an array of objects by a specific key.
 *
 * @example
 * ```ts
 * const array = [{color: 'red'}, {color: 'blue'}];
 * const sorted = array.sortBy('color');
 * assertEq(sorted, [{color: 'blue'}, {color: 'red'}]);
 * ```
 */
Array.prototype.sortBy = function <T extends Obj>(this: T[], key: string): T[] {
    return this.sort((a, b) => {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
    }) as T[];
};

/**
 * Find by a specific key, in an array of objects.
 *
 * @example
 * ```ts
 * const items = [{n: 1}, {n: 2}, {n: 3}];
 * assertEq(items.findBy('n', 2), {n: 2});
 * ```
 */
Array.prototype.findBy = function <T extends Obj>(
    this: T[],
    key: string,
    value: any
): T | undefined {
    return this.find(item => item[key] == value);
};

/**
 * Remove undefined's from an array
 *
 * @example
 * ```ts
 * const items = [1, undefined, 2, 3];
 * assertEq(items.compact(), [1, 2, 3]);
 * ```
 */
Array.prototype.compact = function <T>(this: T[]): Exclude<T, undefined>[] {
    return this.filter(i => i !== undefined) as Exclude<T, undefined>[];
};
