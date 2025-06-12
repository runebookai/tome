<script lang="ts">
    import type { HTMLSelectAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';
    import Flex from '$components/Flex.svelte';
  
    interface Props extends HTMLSelectAttributes {
      ref?: HTMLSelectElement;
      label: string | boolean;
      required?: boolean;
    }
  
    let {
      label,
      name,
      class: cls = '',
      required = false,
      ref = $bindable(),
      value = $bindable(),
      ...rest
    }: Props = $props();
  
    let frequency = $state('hourly');
    let selectedHour = $state('12:00 AM');
  
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour12 = i % 12 === 0 ? 12 : i % 12;
      const ampm = i < 12 ? 'AM' : 'PM';
      return `${hour12}:00 ${ampm}`;
    });
  
    function to24HourFormat(hourStr: string): number {
      const [time, meridiem] = hourStr.split(' ');
      const [hour] = time.split(':').map(Number);

      if (meridiem === 'AM') {
        return hour === 12 ? 0 : hour;
      } else {
        return hour === 12 ? 12 : hour + 12;
      }
    }
  
    function generateCron(): string {
      if (frequency === 'hourly') {
        return '0 * * * *';
      } else {
        const hour = to24HourFormat(selectedHour);
        return `0 ${hour} * * *`;
      }
    }

    $effect(() => {
      const cron = generateCron();
      value = cron;
    });
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
  
    <div class={twMerge("w-full space-y-2", cls?.toString())}>
      <div class="flex items-center space-x-4">
        <label class="flex items-center space-x-1">
          <input type="radio" name={name} bind:group={frequency} value="hourly" />
          <span>Hourly</span>
        </label>
        <label class="flex items-center space-x-1">
          <input type="radio" name={name} bind:group={frequency} value="daily" />
          <span>Daily</span>
        </label>
      </div>
  
      {#if frequency === 'daily'}
        <select
          bind:value={selectedHour}
          class="w-full rounded-md border border-light p-2 px-4 outline-none"
          {name}
          {...rest}
        >
          {#each hours as hour}
            <option value={hour}>{hour}</option>
          {/each}
        </select>
      {/if}
    </div>
  </Flex>
  