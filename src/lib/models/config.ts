import { BaseDirectory, exists, readTextFile } from '@tauri-apps/plugin-fs';

import Model, { type ToSqlRow } from '$lib/models/base.svelte';

export interface IConfig {
    id?: number;
    key: string;
    value: unknown;
}

interface Row {
    id: number;
    key: string;
    value: string;
}

export default class Config extends Model<IConfig, Row>('config') {
    @getset('latest-session-id')
    static latestSessionId: number;

    @getset('welcome-agreed')
    static agreedToWelcome: boolean;

    @getset('skipped-version')
    static skippedVersions: string[];

    @getset('default-model')
    static defaultModel: string;

    static get(key: string) {
        return this.findBy({ key })?.value;
    }

    static set(key: string, value: unknown) {
        const config = this.findBy({ key }) || this.default({ key });
        config.value = value;
        this.save(config);
    }

    static async migrate() {
        const filename = 'tome.conf.json';
        const opt = { baseDir: BaseDirectory.AppData };

        if (!await exists(filename, opt)) {
            return;
        }

        try {
            Object
                .entries(
                    JSON.parse(await readTextFile(filename, opt))
                )
                .forEach(([key, value]) => {
                    if (!this.exists({ key })) {
                        this.create({ key, value });
                    }
                });
        } catch {
            return;
        }
    }

    protected static async fromSql(row: Row): Promise<IConfig> {
        return {
            id: row.id,
            key: row.key,
            value: JSON.parse(row.value),
        }
    }

    protected static async toSql(config: IConfig): Promise<ToSqlRow<Row>> {
        return {
            key: config.key,
            value: JSON.stringify(config.value),
        }
    }
}

function getset(key: string) {
    return function(target: object, property: string) {
        function get() {
            return Config.get(key);
        }

        function set(value: unknown) {
            Config.set(key, value);
        }

        Object.defineProperty(target, property, {
            get,
            set,
        });
    }
}

