/* eslint-disable @typescript-eslint/no-explicit-any */

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }

    /**
     * Utility type for plain, unknown-value, JS Objects
     */
    type Obj = { [key: string]: any };

    interface ObjectConstructor {
        /**
         * Return the Object without k/v pairs where the value is explicitly undefined.
         *
         * Typically you'll use this after mapping a bunch of values where some may be
         * undefined.
         *
         * ```ts
         *
         * const compacted = Object.compact({ a: 1, b: true, c: undefined });
         * assertEq(compacted, { a: 1, b: true });
         *
         * ```
         */
        compact<T>(o: Obj): T;

        /**
         * Return the Object without specific k/v pairs, specified by key.
         *
         * ```ts
         *
         * const subobj = Object.without({a: 1, b: 2}, ['b']);
         * assertEq(subobj, {a: 1})
         *
         * ```
         */
        without<T>(o: Obj, keys: string[]): T;

        /**
         * Remove, and return, a value by key
         *
         * ```ts
         *
         * const value = Object.remove({a: 1, b: 2}, 'b');
         * assertEq(value, 2);
         *
         * ```
         */
        remove<T>(o: Obj, key: string): T | undefined;

        /**
         * Map over the entries of an object
         */
        map<T extends Obj>(o: T, fn: (key: string, value: any) => any): T;
    }

    interface Array<T extends Obj> {
        /**
         * Sort an array of objects by a specific key.
         *
         * ```ts
         *
         * const array = [{color: 'red'}, {color: 'blue'}];
         * const sorted = array.sortBy('color');
         * assertEq(sorted, [{color: 'blue'}, {color: 'red'}]);
         *
         * ```
         */
        sortBy(key: string): T[];

        /**
         * Maps over each object in the array and returns the value of a property
         *
         * ```ts
         *
         * const items = [{a: 1},{a: 3},{a: 5}];
         * assertEq(items.mapBy('a'), [1, 3, 5]);
         *
         * ```
         */
        mapBy<K extends keyof T>(key: K): T[K][];

        /**
         * Find by a specific key, in an array of objects.
         *
         * ```ts
         *
         * const items = [{n: 1}, {n: 2}, {n: 3}];
         * assertEq(items.findBy('n', 2), {n: 2});
         *
         * ```
         */
        findBy(key: string, value: any): T | undefined;

        /**
         * Return the last element in the array
         */
        last(): T;
    }

    interface Array<T> {
        /**
         * Remove undefined's from an array
         *
         * ```ts
         *
         * const items = [1, undefined, 2, 3];
         * assertEq(items.compact(), [1, 2, 3]);
         *
         * ```
         */
        compact(): Array<Exclude<T, undefined>>;

        /**
         * Map over an array with an async function and await them all.
         *
         * ```ts
         * const items = [1, 2, 3];
         *
         * await items.awaitAll(async i => await asyncthing(i));
         *
         * // is equivalent to
         *
         * await Promise.all(items.map(async i => await asyncthing(i)));
         * ```
         */
        awaitAll<K>(fn: (arg0: T) => Promise<K>): Promise<Awaited<K>[]>;
    }

    interface String {
        /**
         * Truncate the text, suffixed by an ellipsis.
         */
        ellipsize(length?: number): string;
    }
}

declare module 'svelte/elements' {
    interface HTMLTextareaAttributes {
        autocorrect?: 'on' | 'off';
    }
}

export {};
