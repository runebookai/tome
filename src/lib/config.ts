import { BaseDirectory, exists, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs"

export const FILENAME = "tome.conf.json";

export const SKIPPED_VERSIONS = 'skipped-versions';

export const DEFAULT_MODEL = 'default-model';

export default class Config {
    static async all(): Promise<Record<string, unknown>> {
        return await this.config();
    }

    static async get<T>(key: string): Promise<T> {
        return (await this.config())[key] as T;
    }

    static async set<T>(key: string, value: T): Promise<boolean> {
        const config = await this.config();
        config[key] = value;
        await writeTextFile(FILENAME, JSON.stringify(config, null, 4), this.opt());
        return true;
    }

    private static async config(): Promise<Record<string, unknown>> {
        // If we haven't created the config file yet, copy over the default one
        // from the App Bundle into the App Data directory.
        if (!await exists(FILENAME, this.opt())) {
            await writeTextFile(FILENAME, "{}", this.opt());
        }

        return JSON.parse(await readTextFile(FILENAME, this.opt()));
    }

    private static opt() {
        return {
            baseDir: BaseDirectory.AppData,
        }
    }
}
