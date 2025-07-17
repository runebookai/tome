<script lang="ts">
    import { type Option } from './types';

    interface Props extends Option {
        onclick: (option: Option) => Promise<unknown> | unknown;
    }

    const { onclick, label, value, icon }: Props = $props();
</script>

<button
    onclick={async () => await onclick({ icon, label, value })}
    class="hover:bg-light text-light-lite hover:text-light
    mx-2 w-[calc(100%-14px)] rounded-sm p-2 px-4
    text-left last:mb-2 hover:cursor-pointer"
>
    {label}
</button>
