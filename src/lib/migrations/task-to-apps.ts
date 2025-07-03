import { App, Task } from '$lib/models';
import AppStep from '$lib/models/app-step.svelte';
import Trigger from '$lib/models/trigger.svelte';

export async function migrate() {
    await Promise.all(
        Task.all().map(async task => {
            const app = await App.findByOrCreate({
                name: task.name,
            });

            await task.update({
                appId: app.id,
            });

            await AppStep.findByOrCreate({
                appId: app.id,
                prompt: task.prompt,
            });

            await Trigger.findByOrCreate({
                appId: app.id,
                event: 'scheduled',
                action: 'tick',
                config: {
                    period: task.period,
                },
            });
        })
    );
}
