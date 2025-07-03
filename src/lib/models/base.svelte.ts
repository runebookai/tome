import type { Part } from '@google/genai';
import Database from '@tauri-apps/plugin-sql';

import { info } from '$lib/logger';

/**
 * Database URL
 */
export const DATABASE_URL = 'sqlite:tome.db';

/**
 * Database connection
 */
export let db: Database;

/**
 * Connect to the database
 */
async function connect() {
    db ||= await Database.load(DATABASE_URL);
}

/**
 * SQL rows should never include reserved columns.
 */
export type ToSqlRow<R> = Omit<R, 'id' | 'created' | 'modified'>;

/**
 * # Model
 *
 * Base of all database models. This class supplies the ORM functions required
 * to interact with the database and the "repo" cache.
 *
 * Model functionality is split by reads and writes. All reads are done from
 * the cache, while writes are done directory to the database, then synced
 * to the cache.
 *
 * ## `Row` Interface
 *
 * The `Row` interface represents a database row. Meaning, property types
 * should match database types as closely as possible.
 *
 * For example, if you have a `datetime` column, it would be returned from the
 * database as a string, so declare that property with `string`. Similarly, `JSON`
 * columns would be represented as a `string`, etc.
 *
 * ## Instantiation
 *
 * You MUST instantiate a model using the static `new` function. This is to
 * work around limitations of JS's constructors + Svelte.
 *
 * ```ts
 * Message.new({ content: 'Heyo' });
 * ```
 *
 * ## Reactivity
 *
 * Models properties MUST be declares using Svelte's `$state()` and provide a
 * default value for required properties.
 *
 * ## Serielization / Deserialization
 *
 * [De]Serialization is handled through two functions `static fromSql(row: Row)` and
 * `toSql()` that you need to implement on your model.
 *
 * ### `static fromSql(row: Row)`
 *
 * Converts a database row (`Row`) into an instance. This is where
 * you should convert fields like dates from a `string` to a `DateTime`, JSON
 * columns from a `string` to a "real" object, etc.
 *
 * This is called when objects are retrieved from the database.
 *
 * ### `toSql()`
 *
 * Convert an instance to a database row (`Row`). This is where you should convert
 * your complex types into simple database types. For example, an object into the
 * JSON stringify'ed version of itself.
 *
 * `toSql` should EXCLUDE properties for columns that are set automatically by
 * the database, like `id`, `created`, or `modified`.
 *
 * ## Lifecycle Callbacks
 *
 * You may implement `beforeCreate`, `afterCreate`, `beforeUpdate`, `afterUpdate`,
 * `beforeSave`, and/or `afterSave`. See the documentation for these functions for
 * more specific information.
 *
 * ## Usage
 *
 * `Model` is a function. It takes one generic type representing the `Row` and the name
 * of the table records reside within.
 *
 * @example
 *
 * ```ts
 * import Base from '$lib/models/base.svelte';
 *
 * interface Row {
 *     user_id: string;
 *     content: string;
 * }
 *
 * class Message extends Base<Row>('messages') {
 *     userId: string = $state('');
 *     content: string = $state('');
 *
 *     static function fromSql(row: Row): Promise<IMessage> {
 *         return new Message({
 *             id: row.id,
 *             userId: row.user_id,
 *             content: row.content,
 *             created: moment.utc(row.created),
 *             modified: moment.utc(row.modified),
 *         }
 *     }
 *
 *     function toSql(): Promise<ToSqlRow<Row>> {
 *        return {
 *            user_id: this.rowId,
 *            content: this.content,
 *        }
 *     }
 * }
 * ```
 */
export default function Model<Row extends object>(table: string) {
    class ModelClass {
        id?: number;

        constructor(params: Partial<object>, privateInvocation = false) {
            if (!privateInvocation) {
                throw 'InvocationError: must instantiate models using `.new()`';
            }
            Object.assign(this, params);
        }

        static new<T extends typeof ModelClass>(
            this: T,
            params: Partial<InstanceType<T>> = {}
        ): InstanceType<T> {
            const inst = new this({}, true);
            Object.assign(inst, inst.default);
            Object.assign(inst, params);
            return inst as InstanceType<T>;
        }

        static async create<T extends typeof ModelClass>(
            this: T,
            params: Partial<InstanceType<T>> = {}
        ): Promise<InstanceType<T>> {
            return await this.new(params).save();
        }

        /**
         * Does a record with specific params exist.
         */
        static exists<T extends typeof ModelClass>(
            this: T,
            params: Partial<InstanceType<T>>
        ): boolean {
            return this.where(params).length > 0;
        }

        /**
         * Retrieve all records.
         */
        static all<T extends typeof ModelClass>(this: T): InstanceType<T>[] {
            return repo as InstanceType<T>[];
        }

        /**
         * Find an individual record by`id`.
         */
        static find<T extends typeof ModelClass>(this: T, id: number): InstanceType<T> {
            return this.all().find(m => m.id == Number(id)) as InstanceType<T>;
        }

        /**
         * Find the first occurence by a subset of the model's properties.
         */
        static findBy<T extends typeof ModelClass>(
            this: T,
            params: Partial<InstanceType<T>>
        ): InstanceType<T> | undefined {
            return this.where(params)[0];
        }

        /**
         * Find by specific properties or instantiate a new instance with them.
         */
        static findByOrNew<T extends typeof ModelClass>(
            this: T,
            params: Partial<InstanceType<T>>
        ): InstanceType<T> {
            return this.findBy(params) || this.new(params);
        }

        /**
         * Find by specific properties or create a new instance.
         */
        static async findByOrCreate<T extends typeof ModelClass>(
            this: T,
            params: Partial<InstanceType<T>>
        ): Promise<InstanceType<T>> {
            return this.findBy(params) || (await this.create(params));
        }

        /**
         * Find a collection of records by a set of the model's properties.
         */
        static where<T extends typeof ModelClass>(
            this: T,
            params: Partial<InstanceType<T>>
        ): InstanceType<T>[] {
            return repo.filter(m =>
                Object.entries(params).every(([k, v]) => (m as Obj)[k] == v)
            ) as InstanceType<T>[];
        }

        /**
         * Find the first record
         */
        static first<T extends typeof ModelClass>(this: T): InstanceType<T> {
            return repo[0] as InstanceType<T>;
        }

        /**
         * Find the last record
         */
        static last<T extends typeof ModelClass>(this: T): InstanceType<T> {
            return repo[repo.length - 1] as InstanceType<T>;
        }

        static async deleteBy<T extends typeof ModelClass>(
            this: T,
            params: Partial<InstanceType<T>>
        ): Promise<boolean> {
            return (await Promise.all(this.where(params).map(async m => await m.delete()))).every(
                i => i == true
            );
        }

        /**
         * Default values for new instance
         */
        get default() {
            return {};
        }

        /**
         * Delete a record, by `id`.
         */
        async delete(): Promise<boolean> {
            const query = await db.execute(`DELETE FROM ${table} WHERE id = $1`, [this.id]);

            if (query.rowsAffected == 1) {
                repo = repo.filter(m => m.id !== this.id);
                return true;
            } else {
                return false;
            }
        }

        /**
         * Update the instance.
         */
        async update(params: Partial<this>): Promise<this> {
            Object.assign(this, params);
            return await this.save();
        }

        /**
         * Update or Create a record.
         *
         * If `params` contains `id`, it will update, otherwise create.
         */
        async save(): Promise<this> {
            return this.id ? await this._update() : await this._create();
        }

        /**
         * Database connection
         */
        protected async db() {
            await connect();
            return db;
        }

        /**
         * Update a record.
         *
         * Only pass the columns you intend to change.
         */
        private async _update(): Promise<this> {
            const cls = this.constructor as typeof ModelClass;

            let row = await this.toSql();
            row = await this.beforeSave(row);
            row = await this.beforeUpdate(row);

            const query = new Query(row);

            const instance = (
                await cls.query<this>(
                    `
                    UPDATE
                        ${table}
                    SET
                        ${query.setters}
                    WHERE
                        id = ${this.id}
                    RETURNING
                        *
                    `,
                    query.values
                )
            )[0];

            cls.syncOne(instance);

            await instance.afterUpdate();
            await instance.afterSave();

            return instance;
        }

        /**
         * Create a new record.
         *
         * You may pass a subset of properties the `Interface` expects and the
         * missing properties will be filled via the `default ` function.
         *
         * `id`, `created`, and `modified` values are ALWAYS ignored, since
         * they are garaunteed to be automatically set by the database.
         */
        private async _create(): Promise<this> {
            const cls = this.constructor as typeof ModelClass;

            let row = await this.toSql();
            row = await this.beforeSave(row);
            row = await this.beforeCreate(row);

            const query = new Query(row);

            const instance = (
                await cls.query<this>(
                    `
                    INSERT INTO
                        ${table} (${query.columns})
                    VALUES
                        (${query.binds})
                    RETURNING
                        *
                    `,
                    query.values
                )
            )[0];

            cls.syncOne(instance);

            await instance.afterCreate();
            await instance.afterSave();

            return instance;
        }

        /**
         * Reload records from the database and populate the Repository.
         */
        static async sync() {
            repo = await this.query(`SELECT * FROM ${table}`);
            info(`[green]✔ ${table} synced`);
        }

        /**
         * Update, or Add, a single record
         */
        protected static syncOne<T extends typeof ModelClass>(this: T, instance: InstanceType<T>) {
            const existing = this.find(Number(instance.id));

            if (existing) {
                Object.assign(existing, instance);
            } else {
                repo.push(instance);
            }
        }

        /**
         * Execute a query in the database.
         */
        protected static async query<T>(sql: string, values: unknown[] = []): Promise<T[]> {
            await connect();
            const rows = await db.select<Row[]>(sql, values);
            const promises = rows.map(async row => await this.fromSql(row));
            return (await Promise.all(promises)) as T[];
        }

        // Abstract Functions

        /**
         * Transform a database `Row` into an instance.
         */
        // eslint-disable-next-line
        protected static async fromSql(row: Row): Promise<unknown> {
            throw 'NotImeplementedError';
        }

        /**
         * Transform an instance into a database `Row`
         */
        protected async toSql(): Promise<ToSqlRow<Row>> {
            throw 'NotImeplementedError';
        }

        /**
         * ## Callbacks
         *
         * Model callbacks occur when an instance is saved (created or updates)
         * or one is read from the database.
         *
         * ### Callback Order
         *   - beforeSave
         *   - before[Create|Update]
         *   - after[Create|Update]
         *   - afterSave
         */

        protected async beforeSave(row: ToSqlRow<Row>): Promise<ToSqlRow<Row>> {
            return row;
        }

        protected async beforeCreate(row: ToSqlRow<Row>): Promise<ToSqlRow<Row>> {
            return row;
        }

        protected async beforeUpdate(row: ToSqlRow<Row>): Promise<ToSqlRow<Row>> {
            return row;
        }

        protected async afterCreate(): Promise<void> {
            // noop
        }

        protected async afterUpdate(): Promise<void> {
            // noop
        }

        protected async afterSave(): Promise<void> {
            // noop
        }
    }

    /**
     * Cache of model instances
     */
    let repo: InstanceType<typeof ModelClass>[] = $state([]);

    return ModelClass;
}

class Query<R extends Obj> {
    row: R;

    constructor(row: R) {
        this.row = row;
    }

    get columns() {
        return Object.keys(this.row).join(', ');
    }

    get setters() {
        return Object.keys(this.row)
            .map((k, i) => `${k} = $${i + 1}`)
            .join(', ');
    }

    get binds() {
        return Object.values(this.row)
            .map((_, i) => `$${i + 1}`)
            .join(', ');
    }

    get values() {
        return Object.values(this.row);
    }
}
