// Data Migrations

import * as tasksToApps from './task-to-apps';
import * as toolCalls from './tool-call-migration';

import { info } from '$lib/logger';
import { Config } from '$lib/models';

export async function migrate() {
    await toolCalls.migrate();
    info('[green]✔ tool calls migrated');

    await Config.migrate();
    info('[green]✔ config migrated');

    await tasksToApps.migrate();
    info('[green]✔ tasks → apps migrated');
}
