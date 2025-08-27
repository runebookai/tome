/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Javascript stdlib extensions
 *
 * This file should only include functions added to standard Javascript
 * objects. Each function needs a cooresponding type definition in
 * `src/app.d.ts`.
 */

// Object

Object.compact = function <T>(o: Obj): T {
    return Object.fromEntries(Object.entries(o).filter(([_, v]) => v !== undefined)) as T;
};

Object.without = function <T>(o: Obj, keys: string[]): T {
    return Object.fromEntries(Object.entries(o).filter(([k, _]) => !keys.includes(k))) as T;
};

Object.remove = function <T>(o: Obj, key: string): T | undefined {
    if (Object.hasOwn(o, key)) {
        const value = o[key];
        delete o[key];
        return value;
    }
};

Object.map = function <T extends Obj>(o: T, fn: (key: string, value: any) => any): T {
    return Object.fromEntries(Object.entries(o).map(([k, v]) => fn(k, v))) as T;
};

// Arrays

Array.prototype.sortBy = function <T extends Obj>(this: T[], key: string): T[] {
    return [...this].sort((a, b) => {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
    }) as T[];
};

Array.prototype.findBy = function <T extends Obj>(
    this: T[],
    key: string,
    value: any
): T | undefined {
    return this.find(item => item[key] == value);
};

Array.prototype.compact = function <T>(this: T[]): Exclude<T, undefined>[] {
    return this.filter(i => i !== undefined) as Exclude<T, undefined>[];
};

Array.prototype.equals = function <T>(this: T[], other: T[]): boolean {
    return this.length == other.length && this.every(value => other.includes(value));
};

Array.prototype.last = function <T>(this: T[]): T {
    return this[this.length - 1];
};

Array.prototype.mapBy = function <T, K extends keyof T>(this: T[], key: K): T[K][] {
    return this.map(item => item[key] as T[K]);
};

Array.prototype.remove = function <T>(this: T[], value: T): T[] {
    return this.splice(this.indexOf(value), 1);
};

Array.prototype.isEmpty = function <T>(this: T[]): boolean {
    return this.length == 0;
};

Array.prototype.awaitAll = async function <T>(
    this: T[],
    fn: (arg0: T) => Promise<any>
): Promise<Awaited<T>[]> {
    return await Promise.all(this.map(fn));
};

// String

String.prototype.ellipsize = function (length: number = 25) {
    return this.substring(0, length - 3) + '...';
};
