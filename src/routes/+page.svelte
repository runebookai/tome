<script lang="ts">
    import { goto } from '$app/navigation';

    import Flex from '$components/Flex.svelte';
    import Layout from '$components/Layouts/Default.svelte';
    import Modal from '$components/Modal.svelte';
    import Svg from '$components/Svg.svelte';
    import Updater from '$components/Updater.svelte';
    import Welcome from '$components/Welcome.svelte';
    import startup, { type Condition, type OnSuccess, StartupCheck } from '$lib/startup';

    const messages = {
        [StartupCheck.NoModels]: 'No Engines Connected',
        [StartupCheck.Agreement]: 'Non Agreement',
        [StartupCheck.UpdateAvailable]: 'Update Available',
    };

    let checks = $state(startup.checks);
    let check = $derived(checks[0]);
    let message: string = $state('');
    let condition: Condition;
    let onSuccess: OnSuccess | undefined;
    let int = $state(0);

    async function checkCondition() {
        if (await condition()) {
            clearInterval(int);
            onSuccess?.();
            checks = checks.slice(1);
        } else {
            message = messages[checks[0][0]];
            clearInterval(int);
            // LSP sometimes thinks this is the Node.js `setInterval`, which
            // returns a `Timeout` object, whereas the browser version returns
            // a `number`. I don't know why.
            int = setInterval(checkCondition, 500) as unknown as number;
        }
    }

    $effect(() => {
        if (checks.length == 0) {
            clearInterval(int);
            goto('/chat/latest');
            return;
        }

        condition = checks[0][1];
        onSuccess = checks[0][2];
        checkCondition();
    });
</script>

<Layout>
    {#if check}
        <Modal>
            {#if check[0] == StartupCheck.Agreement}
                <Welcome />
            {:else if check[0] == StartupCheck.UpdateAvailable}
                <Updater />
            {:else}
                <Flex class="flex-col items-center">
                    <h1 class="text-red flex items-center gap-4 text-2xl">
                        <Svg class="h-6 w-6" name="Warning" />
                        {message}
                    </h1>

                    <a class="self" href="/settings">Settings</a>
                </Flex>
            {/if}
        </Modal>
    {:else}
        <Svg name="Logo" class="text-dark fixed top-[50%] left-[50%] h-32 w-32 -translate-[50%]" />
    {/if}
</Layout>
