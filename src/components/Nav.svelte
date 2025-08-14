<script lang="ts">
    import type { SvelteHTMLElements } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Tooltip from './Tooltip.svelte';

    import Link from '$components/Link.svelte';
    import Svg from '$components/Svg.svelte';
    import { Setting } from '$lib/models';

    const { class: cls }: SvelteHTMLElements['nav'] = $props();
</script>

<nav
    class={twMerge(
        'bg-medium text-medium border-light flex flex-col items-center gap-8 border-r pt-20',
        cls?.toString()
    )}
>
    <Tooltip title="Chat">
        <Link href="/chat/latest" aria-label="chat" prefix="/chat" activeClass="text-purple">
            <Svg name="Chat" />
        </Link>
    </Tooltip>

    <Tooltip title="Apps">
        <Link href="/apps" aria-label="apps" activeClass="text-purple">
            <Svg name="Apps" />
        </Link>
    </Tooltip>

    {#if Setting.LabsMode === 'true'}
        <Tooltip title="Relays">
            <Link href="/relays" aria-label="relays" activeClass="text-purple">
                <Svg name="Relays" />
            </Link>
        </Tooltip>
    {/if}

    <Tooltip title="MCP">
        <Link
            href="/mcp-servers"
            aria-label="mcp-servers"
            prefix="/mcp-servers"
            activeClass="text-purple"
        >
            <Svg name="MCP" />
        </Link>
    </Tooltip>

    <Tooltip title="Models">
        <Link href="/models" aria-label="models" activeClass="text-purple">
            <Svg name="Models" />
        </Link>
    </Tooltip>

    <div class="grow"></div>

    <Tooltip title="Settings">
        <Link
            href="/settings"
            aria-label="settings"
            activeClass="text-purple"
            class="text-dark pb-8"
        >
            <Svg name="Settings" />
        </Link>
    </Tooltip>
</nav>

<style>
    nav :global(svg) {
        width: 32px;
        height: 32px;
    }
</style>
