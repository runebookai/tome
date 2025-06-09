<script lang="ts">
    import { invoke } from '@tauri-apps/api/core';
    import { type Update } from '@tauri-apps/plugin-updater';
    import { goto } from '$app/navigation';

    import Button from '$components/Button.svelte';
    import Flex from '$components/Flex.svelte';
    import Svg from '$components/Svg.svelte';
    import Config from '$lib/models/config.svelte';
    import { availableUpdate } from '$lib/updates';

    let update: Update | null = $state(null);
    let totalDownload: number = $state(0);
    let downloaded: number = $state(0);
    let completed = $state(0);
    let finished = $state(false);
    let message = $state(`Downloading... (0%)`);

    // svelte-ignore non_reactive_update
    let ref: HTMLDivElement;

    async function install() {
        update = await availableUpdate();

        await update?.downloadAndInstall(event => {
            switch (event.event) {
                case 'Started':
                    totalDownload = (event.data.contentLength as number) / 1000.0;
                    break;

                case 'Progress':
                    downloaded += event.data.chunkLength / 1000.0;
                    completed = Math.round((downloaded / totalDownload) * 100);
                    message = `Downloading... (${completed}%)`;
                    ref.setAttribute('style', `width:${completed}%`);
                    break;

                case 'Finished':
                    message = 'Installing...';
                    break;
            }
        });

        message = 'Complete';
        finished = true;
    }

    async function skip() {
        const update = (await availableUpdate()) as Update;
        const skipped: string[] = Config.skippedVersions || [];

        skipped.push(update.version);
        Config.skippedVersions = skipped;
        await goto('/');
    }

    async function restart() {
        await invoke('restart');
    }
</script>

<Flex class="w-full items-start">
    <Svg name="Updates" class="mt-2 mr-8 h-12 w-12" />

    {#if update}
        <Flex class="w-full flex-col items-start">
            <h2 class="font-semibold">Installing Tome {update.version}</h2>
            <div class="bg-light mt-4 h-2 w-full rounded-full">
                <div
                    bind:this={ref}
                    style={`width: ${completed}%`}
                    class="bg-purple h-2 rounded-full"
                ></div>
            </div>
            <p class="text-medium mt-2 text-xs">
                {message}
            </p>

            {#if finished}
                <Button onclick={restart} class="border-purple text-purple mt-4 self-end">
                    Restart
                </Button>
            {/if}
        </Flex>
    {:else}
        <Flex class="w-full flex-col items-start">
            <h2 class="font-semibold">Updates Available</h2>
            <p>A new Tome is ready to be installed</p>

            <Flex class="mt-8 gap-4 self-end">
                <Button onclick={skip} class="border-light text-medium">Skip this version</Button>
                <Button onclick={install} class="border-purple text-purple">Install</Button>
            </Flex>
        </Flex>
    {/if}
</Flex>
