import Database from "@tauri-apps/plugin-sql";

import { DATABASE_URL } from "$lib/const";
import { info } from "$lib/logger";

/**
 * Database connection
 */
export let db: Database;

/**
 * SQL rows should never include reserved columns.
 */
export type ToSqlRow<Row> = Omit<Row, 'id' | 'created' | 'modified'>;

/**
 * Columns that should never be included in an UPDATE or INSERT query.
 */
export const ReservedColumns = ['id', 'created', 'modified'];

/**
 * # Model
 *
 * Base of all database models. This class supplies the ORM functions required
 * to interact with the database and the "repo" pass-through layer.
 *
 * Model functionality is split by reads and writes. All reads are done from
 * the repo, while writes are done directory to the database, then synced
 * to the repo.
 *
 * ## Static Methods All the Way Down
 *
 * Since Svelte's reactivity only works on basic data structures – more or
 * less – we can't pass around instances of models. Instead, functions that
 * require an "instance" of a model needs to accept a object as an argument.
 *
 * NOTE: I'm a bit unsure of a ststic class interface is the right choice for 
 * models. An alternative would be to build plain JS objects. This would remove
 * the need for all the `static` non-sense. :shrug:
 *
 * ## `Instance` Interface
 *
 * The `Instance` interface represent the object you pass around the app. They 
 * are simple JS objects.
 *
 * `Instance` properties shouild reflect the interface you want to use in the
 * app. Meaning, camelCase keys and complex types (if needed).
 *
 * Foreign key properties should be optional to allow new `Instance`s to be
 * created where you don't know the associations at instantiation.
 *
 * ## `Row` Interface
 *
 * The `Row` interface represents a database row. Meaning, property types
 * should match database types as closely as possible.
 *
 * For example, if you have a datetime column, it would be returned from the
 * database as a string, so declare that property with `string`, `JSON` columns
 * are represented as a `string`, etc.
 *
 * ## Serielization / Deserialization
 *
 * [De]Serialization is handled through two functions `fromSql` and `toSql`
 * that you need to implement on your model.
 *
 * ### `fromSql`
 *
 * Converts a database row (`Row`) into an instance (`Instance`). This is where
 * you should convert fields like dates from a `string` to a `DateTime`, JSON 
 * columns from a `string` to a "real" object, etc.
 *
 * This is called when objects are retrieved from the database.
 *
 * ### `toSql`
 *
 * Convert an instance (`Instance`) to a database row (`Row`). This is where
 * you should convert your complex types into simple database types. For
 * example, an object into the JSON stringify'ed version of itself.
 *
 * `toSql` should EXCLUDE properties for columns that are set automatically by
 * the database, like `id`, `created`, or `modified`.
 *
 * ## Lifecycle Callbacks
 *
 * You may implement `beforeCreate`, `afterCreate`, `beforeUpdate`, and
 * `afterUpdate`. See the documentation for these functions for more specific
 * information.
 *
 * ## Usage
 *
 * `Model` is a function. It takes two generic types and the name of the table
 * records reside within.
 *
 * @example
 * 
 * ```ts
 * export interface IMessage {
 *     userId: string;
 *     content: string;
 * }
 *
 * interface Row {
 *     user_id: string;
 *     content: string;
 * }
 *
 * class Message extends Model<Interface, Row>('messages') {
 *     static function fromSql(row: Row): Promise<IMessage> {
 *         return {
 *             id: row.id,
 *             userId: row.user_id,
 *             content: row.content,
 *             created: moment.utc(row.created),
 *             modified: moment.utc(row.modified),
 *         }
 *     }
 *
 *     static function toSql(message: IMessage): Promise<ToSqlRow<Row>> {
 *        return {
 *            user_id: message.rowId,
 *            content: message.content,
 *        }
 *     }
 * }
 * ```
 */
export default function Model<Interface extends Obj, Row extends Obj>(table: string) {
    let repo: Interface[] = $state([]);

    return class Model {
        static defaults = {};

        /** 
         * Reload records from the database and populate the Repository.
         */
        static async sync(): Promise<void> {
            repo = [];

            (await this.query(`SELECT * FROM ${table}`))
                .forEach(record => this.syncOne(record));

            info(`[green]✔ synced ${table}`);
        }

        /** 
         * Create an empty, default, object.
         *
         * Use this instead of the `new Whatever()` syntax, as we need to
         * always be passing around plain old JS objects for Svelte's
         * reactivity to work properly.
         */
        static default(defaults: Partial<Interface> = {}): Interface {
            defaults = typeof this.defaults == 'function'
                ? { ...this.defaults(), ...defaults }
                : { ...this.defaults, ...defaults };

            return defaults as Interface;
        }

        /**
         * Does a record with specific params exist.
         */
        static exists(params: Partial<Interface>): boolean {
            return this.where(params).length > 0;
        }

        /**
         * Retrieve all records.
         */
        static all(): Interface[] {
            return repo;
        }

        /**
         * Find an individual record by`id`.
         */
        static find(id: number | string): Interface {
            return this.all().find(m => m.id == Number(id)) as Interface;
        }

        /** 
         * Find the first occurence by a subset of the model's properties.
         */
        static findBy(params: Partial<Interface>): Interface | undefined {
            return this.where(params)[0];
        }

        /** 
         * Find a collection of records by a set of the model's properties.
         */
        static where(params: Partial<Interface>): Interface[] {
            return repo.filter(m => {
                return Object
                    .entries(params)
                    .every(([key, value]) => (
                        m[key] == value
                    ))
            });
        }

        /** 
         * Find the first record
         */
        static first(): Interface {
            return repo[0];
        }

        /** 
         * Find the last record
         */
        static last(): Interface {
            return repo[repo.length - 1];
        }

        /**
         * Update or Create a record.
         *
         * If `params` contains `id`, it will update, otherwise create.
         */
        static async save(params: Interface): Promise<Interface> {
            if (params.id) {
                return await this.update(params);
            } else {
                return await this.create(params);
            }
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
        static async create(_params: Partial<Interface>): Promise<Interface> {
            let row = await this.toSql(
                this.exclude(
                    {
                        ...this.default(),
                        ..._params,
                    },
                    ReservedColumns,
                )
            );

            row = await this.beforeSave(row);
            row = await this.beforeCreate(row);

            const columns = this.columns(row).join(', ');
            const binds = this.binds(row).join(', ');
            const values = Object.values(row);

            let instance = (await this.query(
                `INSERT INTO ${table} (${columns}) VALUES(${binds}) RETURNING * `,
                values,
            ))[0];

            this.syncOne(instance);
            this.removeEphemeralInstances();

            instance = await this.afterCreate(instance);
            instance = await this.afterSave(instance);

            return instance;
        }

        /** 
         * Update a record.
         *
         * Only pass the columns you intend to change.
         */
        static async update(_params: Interface): Promise<Interface> {
            let row = await this.toSql(
                this.exclude(_params, ReservedColumns)
            );

            row = await this.beforeSave(row);
            row = await this.beforeUpdate(row);

            const setters = this.setters(row).join(', ');
            const values = [...Object.values(row), _params.id];
            const idBind = `$${values.length} `;

            let instance = (await this.query(
                `UPDATE ${table} SET ${setters} WHERE id = ${idBind} RETURNING * `,
                values,
            ))[0];

            this.syncOne(instance);
            this.removeEphemeralInstances();

            instance = await this.afterUpdate(instance);
            instance = await this.afterSave(instance);

            return instance;
        }

        /**
         * Delete a record, by`id`.
         */
        static async delete(id: number): Promise<boolean> {
            const result = (
                await (await this.db()).execute(
                    `DELETE FROM ${table} WHERE id = $1`,
                    [id],
                )
            ).rowsAffected == 1;

            const i = this.find(id);
            this.syncRemove(i);

            return result;
        }

        /**
         * Delete a record by a subset of columns
         */
        static async deleteBy(params: Partial<Row>): Promise<boolean> {
            const conditions = this.setters(params).join(' AND ');
            const values = Object.values(params);

            const instances = await this.query(
                `SELECT * FROM ${table} WHERE ${conditions} `,
                values,
            );

            const success = (
                await (await this.db()).execute(
                    `DELETE FROM ${table} WHERE ${conditions} `,
                    values,
                )
            ).rowsAffected >= 1;

            if (success) {
                instances.forEach(instance => {
                    this.syncRemove(instance);
                });
            }

            return success;
        }

        /** 
         * Run a query in the database, returning an object implementing`Instance`.
         */
        protected static async query(sql: string, values: unknown[] = []): Promise<Interface[]> {
            const result: Row[] = (
                await (await this.db()).select<Row[]>(sql, values)
            );

            return await Promise.all(
                result.map(
                    async (row) => await this.fromSql(row),
                ),
            );
        }

        /**
         * Memoized database connection.
         */
        protected static async db(): Promise<Database> {
            if (!db) {
                db = await Database.load(DATABASE_URL);
            }
            return db;
        }

        /** 
         * Update, or Add, a single record
         */
        private static syncOne(record: Interface) {
            const existing = this.find(record.id);

            if (existing) {
                Object.assign(existing, record);
            } else {
                const reactive = $state(record);
                repo.push(reactive);
            }
        }

        /** 
         * Remove an instance from the repo
         */
        private static syncRemove(instance: Interface) {
            repo = repo.filter(
                i => i.id !== instance.id
            );
        }

        /** 
         * Remove ephemeral instances from the repo.
         *
         * Pages will often push an "empty" instance into a list of models, to
         * so that it renders in a list and the user can configure it.
         *
         * We need to remove those "ephemeral" instances when we save a record,
         * otherwise both would show up and appear to be duplicate.
         *
         * This leaves only persisted records(ones with an`id`).
         */
        private static removeEphemeralInstances() {
            repo = repo.filter(
                record => record.id !== undefined
            );
        }

        /** 
         * Exclude k / v pairs in an object, by a list of keys.
         */
        private static exclude<T extends Obj>(params: T, exclude: string[]): T {
            return Object.fromEntries(
                Object
                    .entries(params)
                    .filter(([k, _]) => !exclude.includes(k)),
            ) as T;
        }

        /** 
         * Retrieve the list of columns from`params`.
         *
         * Mostly just a more descriptive name for the operation.
         */
        private static columns<P extends Obj>(params: P): string[] {
            return Object.keys(params);
        }

        /** 
         * Generate a list of `$k = $#` statements from`params`.
         *
         * `$k` is the name of the column and `$#` is the bind parameter.
         */
        private static setters<P extends Obj>(params: P): string[] {
            return Object.keys(params).map((k, i) => `${k} = $${i + 1} `);
        }

        /** 
         * Individual numeric bind statements, like`['$1', '$2']`.
         */
        private static binds<P extends Obj>(params: P): string[] {
            return Object.values(params).map((_, i) => `$${i + 1} `);
        }

        /** 
         * Transform a raw database row into an `Interface` object.
         */
        protected static async fromSql(_: Row): Promise<Interface> {
            throw "NotImplementedError";
        }

        /** 
         * Transform an `Interface` object into a `Row` of database compatiable
         * values.
         */
        protected static async toSql(_: ToSqlRow<Interface>): Promise<ToSqlRow<Row>> {
            throw "NotImplementedError";
        }

        /** 
         * Transform the `Row` object before it's used to generate a query.
         */
        protected static async beforeSave(row: ToSqlRow<Row>): Promise<ToSqlRow<Row>> {
            return row;
        }

        /** 
         * Transform the `Instance` object after it's created/updated/retrieved
         * from the database.
         */
        protected static async afterSave(instance: Interface): Promise<Interface> {
            return instance;
        }

        protected static async beforeCreate(row: ToSqlRow<Row>): Promise<ToSqlRow<Row>> {
            return row;
        }

        protected static async afterCreate(instance: Interface): Promise<Interface> {
            return instance;
        }

        protected static async beforeUpdate(row: ToSqlRow<Row>): Promise<ToSqlRow<Row>> {
            return row;
        }

        protected static async afterUpdate(instance: Interface): Promise<Interface> {
            return instance;
        }
    }
}

/**
 * Model class NOT backed by a database
 */
export function BareModel<T extends Obj>() {
    let repo: T[] = $state([]);

    return class BareModel {
        static reset(instances: T[] = []) {
            repo = instances;
        }

        static add(instance: T) {
            repo.push(instance);
        }

        static delete(instance: T) {
            repo = repo.filter(i => i !== instance);
        }

        static all(): T[] {
            return repo;
        }

        static find(id: string): T | undefined {
            return repo.findBy('id', id);
        }

        static first(): T {
            return repo[0];
        }

        static last(): T {
            return repo[repo.length - 1];
        }
    }
}
