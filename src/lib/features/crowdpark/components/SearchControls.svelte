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
		onfocus,
		onfilter,
		hasActiveFilter = false
	}: {
		value?: string;
		placeholder?: string;
		onsearch?: () => void;
		onfocus?: () => void;
		onfilter?: () => void;
		hasActiveFilter?: boolean;
	} = $props();
</script>

<div class="flex w-full items-center gap-2">
	<InputGroup.Root
		class="h-14 flex-1 rounded-full border border-border bg-background shadow-xs transition-all hover:border-primary/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:bg-card/70"
	>
		<InputGroup.Addon class="pl-3">
			<SearchIcon class="size-5 text-muted-foreground" />
		</InputGroup.Addon>
		<InputGroup.Input
			bind:value
			{placeholder}
			{onfocus}
			onkeydown={(e) => {
				if (e.key === 'Enter' && onsearch) {
					onsearch();
				}
			}}
			class="text-sm tracking-[-0.04em] placeholder:text-muted-foreground/70"
		/>
		{#if onsearch && value}
			<InputGroup.Addon align="inline-end" class="pr-2">
				<Button
					onclick={onsearch}
					size="icon"
					class="size-10 rounded-full transition-transform active:scale-95"
					aria-label="Search"
				>
					<ArrowRightIcon class="size-4" />
				</Button>
			</InputGroup.Addon>
		{/if}
	</InputGroup.Root>
	<div class="relative shrink-0">
		<Button
			variant="dark"
			size="icon-lg"
			aria-label="Filter parking"
			class="size-14 rounded-full shadow-xs cursor-pointer active:scale-95 transition-transform"
			onclick={onfilter}
		>
			<SlidersHorizontalIcon class="size-5 text-white" />
		</Button>
		{#if hasActiveFilter}
			<span class="absolute -top-0.5 -right-0.5 size-3.5 rounded-full bg-primary ring-2 ring-background animate-pulse pointer-events-none"></span>
		{/if}
	</div>
</div>
