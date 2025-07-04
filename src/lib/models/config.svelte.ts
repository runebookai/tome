import { BaseDirectory, exists, readTextFile } from '@tauri-apps/plugin-fs';

import Base, { type ToSqlRow } from '$lib/models/base.svelte';

interface Row {
    id: number;
    key: string;
    value: string;
}

export type ConfigKey =
    | 'latest-session-id'
    | 'welcome-agreed'
    | 'skipped-version'
    | 'default-model'
    | 'null';

export default class Config extends Base<Row>('config') {
    id?: number = $state();
    key: ConfigKey = $state('null');
    value: unknown = $state();

    @getset('latest-session-id')
    static latestSessionId: number;

    @getset('welcome-agreed')
    static agreedToWelcome: boolean;

    @getset('skipped-version')
    static skippedVersions: string[];

    @getset('default-model')
    static defaultModel: string;

    static async migrate() {
        const filename = 'tome.conf.json';
        const opt = { baseDir: BaseDirectory.AppData };

        if (!(await exists(filename, opt))) {
            return;
        }

        try {
            Object.entries(JSON.parse(await readTextFile(filename, opt))).forEach(([k, value]) => {
                const key = k as ConfigKey;
                if (!this.exists({ key })) {
                    this.create({ key, value });
                }
            });
        } catch {
            return;
        }
    }

    protected static async fromSql(row: Row): Promise<Config> {
        return Config.new({
            id: row.id,
            key: row.key as ConfigKey,
            value: JSON.parse(row.value),
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            key: this.key,
            value: JSON.stringify(this.value),
        };
    }
}

function getset(key: ConfigKey) {
    return function (target: object, property: string) {
        function get() {
            return Config.findBy({ key })?.value;
        }

        async function set(value: unknown) {
            const config = Config.findBy({ key }) || Config.new({ key });
            config.value = value;
            await config.save();
        }

        Object.defineProperty(target, property, {
            get,
            set,
        });
    };
}
