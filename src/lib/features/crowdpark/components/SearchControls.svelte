<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import SearchIcon from '@lucide/svelte/icons/search';
	import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal';
	import { Button } from '$lib/components/ui/button';
	import * as InputGroup from '$lib/components/ui/input-group';
	let {
		value = $bindable(''),
		placeholder = 'Search Destination',
		onsearch,
		onfocus
	}: {
		value?: string;
		placeholder?: string;
		onsearch?: () => void;
		onfocus?: () => void;
	} = $props();
</script>

<div class="flex w-full items-center gap-2">
	<InputGroup.Root class="h-14 flex-1 rounded-full border-0 bg-muted shadow-none">
		<InputGroup.Addon><SearchIcon /></InputGroup.Addon>
		<InputGroup.Input bind:value {placeholder} {onfocus} class="text-sm tracking-[-0.04em]" />
		{#if onsearch && value}<InputGroup.Addon align="inline-end"
				><Button onclick={onsearch} size="icon" class="rounded-2xl" aria-label="Search"
					><ArrowRightIcon /></Button
				></InputGroup.Addon
			>{/if}
	</InputGroup.Root>
	<Button variant="dark" size="icon-lg" aria-label="Filter parking" class="size-14 rounded-full"
		><SlidersHorizontalIcon /></Button
	>
</div>
