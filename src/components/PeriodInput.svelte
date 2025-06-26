<script lang="ts">
    import type { HTMLSelectAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Flex from '$components/Flex.svelte';

    interface Props extends HTMLSelectAttributes {
        ref?: HTMLSelectElement;
        label: string | boolean;
        required?: boolean;
        onchange?: () => Promise<void>;
    }

    let {
        label,
        name,
        class: cls = '',
        required = false,
        ref = $bindable(),
        value = $bindable(),
        onchange,
    }: Props = $props();

    let frequency = $state(isHourly(value) ? 'hourly' : 'daily');
    let selectedHour = $state(cronHour(value));

    const hours = Array.from({ length: 24 }, (_, i) => {
        const hour = i % 12 === 0 ? 12 : i % 12;
        const ampm = i < 12 ? 'AM' : 'PM';
        return [String(i), `${hour}:00 ${ampm}`];
    });

    function isHourly(period: string) {
        return cronHour(period) == '*';
    }

    function cronHour(period: string) {
        return period.split(' ')[1];
    }

    async function setHourly() {
        frequency = 'hourly';
        value = '0 * * * *';
        await onchange?.();
    }

    async function setDaily() {
        frequency = 'daily';
        value = `0 ${selectedHour} * * *`;
        await onchange?.();
    }
</script>

<Flex class="w-full flex-col items-start">
    {#if label}
        <label class="text-medium mt-2 mb-1 ml-2 text-sm" for={name}>
            {label}
            {#if required}
                <span class="text-red">*</span>
            {/if}
        </label>
    {/if}

    <div class={twMerge('w-full space-y-2', cls?.toString())}>
        <div class="flex flex-col items-start space-x-4">
            <label class="flex items-center space-x-1">
                <input
                    {name}
                    type="radio"
                    bind:group={frequency}
                    value="hourly"
                    onchange={setHourly}
                />
                <span>Hourly</span>
            </label>

            <label class="flex items-center space-x-1">
                <input
                    {name}
                    type="radio"
                    bind:group={frequency}
                    value="daily"
                    onchange={setDaily}
                />
                <span>Daily</span>

                {#if frequency === 'daily'}
                    <p class="mx-1">at</p>
                    <select
                        {name}
                        bind:value={selectedHour}
                        onchange={setDaily}
                        class="border-light w-full rounded-md border p-2 px-4 outline-none"
                    >
                        {#each hours as [value, text] (value)}
                            <option selected={selectedHour == value} {value}>{text}</option>
                        {/each}
                    </select>
                {/if}
            </label>
        </div>
    </div>
</Flex>

