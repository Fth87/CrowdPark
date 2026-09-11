<script lang="ts">
	import CarFrontIcon from '@lucide/svelte/icons/car-front';
	import BikeIcon from '@lucide/svelte/icons/bike';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	let { value = $bindable('motorcycle') }: { value?: string } = $props();
</script>

<ToggleGroup.Root
	type="single"
	bind:value
	variant="brand"
	class="h-[54px] w-full rounded-[22px] border p-1.5 shadow-xs"
>
	<ToggleGroup.Item value="motorcycle" class="h-[38px] flex-1 rounded-2xl"
		><BikeIcon />Motorcycle</ToggleGroup.Item
	>
	<ToggleGroup.Item value="car" class="h-[38px] flex-1 rounded-2xl"
		><CarFrontIcon />Car</ToggleGroup.Item
	>
</ToggleGroup.Root>
