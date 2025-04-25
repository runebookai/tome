<script lang="ts">
	import { kebabCase } from 'change-case';
	import type { HTMLInputAttributes } from 'svelte/elements';

	import Flex from '$components/Flex.svelte';
	import type { CheckboxEvent } from '$lib/types';

	interface Props extends HTMLInputAttributes {
		value?: 'on' | 'off';
		label: string;
		disabled?: boolean;
		onEnable: () => void;
		onDisable: () => void;
	}

	const { value, label, disabled, onEnable, onDisable, ...rest }: Props = $props();

	let enabled = $state(false);

	function onChange(e: CheckboxEvent) {
		if (e.currentTarget.checked) {
			enabled = true;
			onEnable();
		} else {
			enabled = false;
			onDisable();
		}
	}
</script>

<Flex>
	<div class="toggle">
		<input
			{...rest}
			{disabled}
			checked={value == 'on'}
			onchange={onChange}
			type="checkbox"
			name={kebabCase(label)}
			class:disabled
			class="check"
		/>
		<label class:disabled for={kebabCase(label)}></label>
	</div>

	<p class:disabled class={`${enabled ? 'text-grey-200' : 'text-grey-500'} ml-4`}>
		{label}
	</p>
</Flex>

<style>
	.toggle {
		position: relative;
		width: 50px;
		height: 25px;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

	.check {
		position: absolute;
		width: 50px;
		height: 25px;
		top: 0;
		left: 0;
		z-index: 10;
		opacity: 0;
	}

	label {
		position: absolute;
		top: 0;
		left: 0;
		width: 50px;
		height: 25px;
		border-radius: 50px;
		cursor: pointer;
		background: linear-gradient(to bottom, #111, #333);
		transition: all 0.3s ease;
		z-index: 0;
	}

	label.disabled {
		opacity: 25%;
	}

	label:after {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 21px;
		height: 21px;
		border-radius: 50%;
		background-color: #999;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		transition: all 0.3s ease;
	}

	.check:checked + label {
		background: linear-gradient(to bottom, #4cd96466, #5de24e66);
	}

	.check:checked + label:after {
		transform: translateX(25px);
		background-color: #ccc;
	}

	p.disabled {
		opacity: 25%;
	}
</style>
