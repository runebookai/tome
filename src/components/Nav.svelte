<script lang="ts">
    import type { SvelteHTMLElements } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Link from '$components/Link.svelte';
    import Svg from '$components/Svg.svelte';

    const { class: cls }: SvelteHTMLElements['nav'] = $props();
</script>

<nav
    class={twMerge(
        'bg-medium text-medium border-light flex flex-col items-center gap-8 border-r pt-20',
        cls?.toString()
    )}
>
    <!--
    This link MUST NOT preload data on hover, since it redirects when it does.
    Which means we'd navigate on hover instead of click.
    -->
    <Link href="/chat/latest" aria-label="chat" prefix="/chat" activeClass="text-purple">
        <Svg name="Chat" />
    </Link>

    <Link href="/tasks" aria-label="tasks" activeClass="text-purple">
        <Svg name="Tasks" />
    </Link>

    <Link
        href="/mcp-servers"
        aria-label="mcp-servers"
        prefix="/mcp-servers"
        activeClass="text-purple"
    >
        <Svg name="MCP" />
    </Link>

    <Link href="/models" aria-label="models" activeClass="text-purple">
        <Svg name="Models" />
    </Link>

    <div class="grow"></div>

    <Link href="/settings" aria-label="settings" activeClass="text-purple" class="text-dark pb-8">
        <Svg name="Settings" />
    </Link>
</nav>

<style>
    nav :global(svg) {
        width: 32px;
        height: 32px;
    }
</style>
