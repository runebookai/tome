<script lang="ts">
    import { constantCase } from 'change-case';
    import type { HTMLAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Flex from '$components/Flex.svelte';
    import LabeledSection from '$components/Forms/LabeledSection.svelte';
    import Input from '$components/Input.svelte';
    import Svg from '$components/Svg.svelte';
    import { McpServer } from '$lib/models';
    import { join, split } from '$lib/shellwords';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        server: McpServer;
    }

    let { server, class: cls = '' }: Props = $props();

    let command: string = $state(`${server.command} ${join(server.args)}`.trim());
    let env: [string, string][] = $state(Object.entries(server.env));

    let key: string = $state('');
    let value: string = $state('');

    async function addEnv() {
        if (!env) {
            return;
        }

        env.push([key, value]);
        key = '';
        value = '';
    }

    async function remove(key: string) {
        if (!env) {
            return;
        }

        env = env.filter(e => e[0] !== key);
    }

    $effect(() => {
        const cmd = split(command);
        const envVars = Object.fromEntries(env.map(([k, v]) => [constantCase(k), v]));

        server.command = cmd[0];
        server.args = cmd.slice(1);
        server.env = envVars;
    });
</script>

<Flex
    class={twMerge('border-light w-full flex-col items-start rounded-md border', cls?.toString())}
    onclick={e => e.stopPropagation()}
>
    <LabeledSection icon="Command" title="Command">
        <Input
            bind:value={command}
            name="command"
            class="w-full px-4 py-1"
            placeholder="<uvx | npx> COMMAND [args]"
        />
    </LabeledSection>

    <LabeledSection icon="Env" title="ENV" class="border-none">
        <Flex class="w-full flex-col items-start">
            {#each env, i (i)}
                <Flex class="mb-4 w-full gap-4">
                    <Input
                        label={false}
                        placeholder="Key"
                        bind:value={env[i][0]}
                        class="uppercase"
                    />

                    <Input label={false} placeholder="Value" bind:value={env[i][1]} />

                    <button
                        class="text-dark hover:text-red ml-4 transition duration-300 hover:cursor-pointer"
                        onclick={() => remove(env[i][0])}
                    >
                        <Svg name="Delete" class="h-4 w-4" />
                    </button>
                </Flex>
            {/each}

            <Flex class="w-full gap-4">
                <Input bind:value={key} label={false} placeholder="Key" class="uppercase" />
                <Input bind:value onchange={addEnv} label={false} placeholder="Value" />
                <div class="w-16"></div>
            </Flex>
        </Flex>
    </LabeledSection>
</Flex>
