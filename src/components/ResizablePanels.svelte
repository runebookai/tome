<script lang="ts">
    import { onMount } from 'svelte';
    import type { Snippet } from 'svelte';

    interface Panel {
        id: string;
        minWidth: number;
        defaultWidth: number;
    }

    interface Props {
        panels: Panel[];
        class?: string;
        children: Snippet<[number]>;
    }

    let { panels, class: className = '', children }: Props = $props();

    let containerRef: HTMLElement;
    let isResizing = $state(false);
    let activeResizer = $state<number | null>(null);
    let panelWidths = $state<number[]>([]);

    // Initialize panel widths
    onMount(() => {
        if (!containerRef) return;
        
        const containerWidth = containerRef.offsetWidth;
        const totalDefaultWidth = panels.reduce((sum, panel) => sum + panel.defaultWidth, 0);
        
        if (containerWidth > totalDefaultWidth) {
            // If container is wider than total default width, expand middle panels
            panelWidths = panels.map((panel, index) => {
                if (index === 0 || index === panels.length - 1) {
                    // Keep first and last panels at default width
                    return panel.defaultWidth;
                } else {
                    // Expand middle panels to fill remaining space
                    const sideWidths = panels[0].defaultWidth + panels[panels.length - 1].defaultWidth;
                    return containerWidth - sideWidths;
                }
            });
        } else {
            panelWidths = panels.map(panel => panel.defaultWidth);
        }
    });

    function handleMouseDown(index: number) {
        return (e: MouseEvent) => {
            e.preventDefault();
            isResizing = true;
            activeResizer = index;
            
            const handleMouseMove = (e: MouseEvent) => {
                if (!isResizing || activeResizer === null) return;
                
                const containerRect = containerRef.getBoundingClientRect();
                const mouseX = e.clientX - containerRect.left;
                
                // Calculate new widths
                const newWidths = [...panelWidths];
                const leftIndex = activeResizer;
                const rightIndex = activeResizer + 1;
                
                // Calculate the total width of the two panels being resized
                const totalWidth = panelWidths[leftIndex] + panelWidths[rightIndex];
                
                // Calculate how much space the mouse position takes from left panel
                const currentLeft = panelWidths.slice(0, leftIndex).reduce((sum, width) => sum + width, 0);
                const leftPanelWidth = Math.max(
                    panels[leftIndex].minWidth,
                    Math.min(totalWidth - panels[rightIndex].minWidth, mouseX - currentLeft)
                );
                
                newWidths[leftIndex] = leftPanelWidth;
                newWidths[rightIndex] = totalWidth - leftPanelWidth;
                
                panelWidths = newWidths;
            };
            
            const handleMouseUp = () => {
                isResizing = false;
                activeResizer = null;
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };
    }
</script>

<div 
    bind:this={containerRef}
    class={`flex h-full ${className}`}
    style="user-select: {isResizing ? 'none' : 'auto'}"
>
    {#each panels as panel, index (panel.id)}
        <div 
            class="relative h-full overflow-auto"
            style="width: {panelWidths[index]}px; min-width: {panel.minWidth}px"
        >
            {@render children(index)}
        </div>
        
        {#if index < panels.length - 1}
            <div 
                class="bg-light hover:bg-medium group relative w-1 cursor-col-resize border-l border-r border-transparent hover:border-blue-500 transition-colors"
                onmousedown={handleMouseDown(index)}
            >
                <div class="absolute inset-0 -mx-1"></div>
                <div class="bg-blue-500 absolute left-1/2 top-1/2 h-8 w-0.5 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
        {/if}
    {/each}
</div>

<style>
    :global(body.resizing) {
        cursor: col-resize !important;
        user-select: none !important;
    }
</style>