<script lang="ts">
    const { children, class: cls = '' } = $props();
</script>

<td class={cls?.toString()}>
    {@render children?.()}
</td>
