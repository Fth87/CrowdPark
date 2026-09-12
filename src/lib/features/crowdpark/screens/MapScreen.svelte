<script lang="ts">
	import { page } from '$app/state';
	import { MediaQuery } from 'svelte/reactivity';
	import * as Drawer from '$lib/components/ui/drawer';
	import AppChrome from '../components/AppChrome.svelte';
	import MapCanvas from '../components/MapCanvas.svelte';
	import MobileHeader from '../components/MobileHeader.svelte';
	import ParkingDetails from '../components/ParkingDetails.svelte';
	import SearchControls from '../components/SearchControls.svelte';
	import VehicleToggle from '../components/VehicleToggle.svelte';
	let query = $state('Stasiun Yogyakarta');
	let vehicle = $state('motorcycle');
	let selected = $state(page.url.searchParams.has('spot'));
	let activeId = $state<string | undefined>(undefined);
	const isDesktop = new MediaQuery('(min-width: 768px)');
</script>

<svelte:head><title>Maps · CrowdPark</title></svelte:head>
<AppChrome active="maps" />
<MobileHeader />
<main class="relative h-[calc(100dvh-78px)] overflow-hidden md:h-screen md:pt-16">
	<div class="absolute inset-x-0 top-[146px] bottom-0 md:top-16 md:left-[438px]">
		<MapCanvas onselect={(spot) => { selected = true; activeId = spot.id?.toString(); }} />
	</div>
	<aside
		class="absolute top-0 right-0 left-0 z-10 bg-background px-4 pb-5 md:top-16 md:right-auto md:bottom-8 md:w-[438px] md:px-10 md:pt-8"
	>
		<h1 class="mb-2 hidden text-xl font-medium md:block">Find your destination</h1>
		<SearchControls bind:value={query} />
		<div class="mt-4"><VehicleToggle bind:value={vehicle} /></div>
		<div class="mt-6 hidden md:block">
			<div class="h-[300px] overflow-hidden rounded-[28px] border">
				<MapCanvas mode="location" interactive={false} />
			</div>
		</div>
	</aside>
	{#if isDesktop.current}
		{#if selected}<div class="absolute top-16 bottom-8 left-0 z-30 w-[438px] overflow-y-auto">
				<ParkingDetails sheet id={activeId} />
			</div>{/if}
	{:else}
		<Drawer.Root bind:open={selected}>
			<Drawer.Content class="max-h-[77dvh]">
				<Drawer.Header class="sr-only"
					><Drawer.Title>{query} parking overview</Drawer.Title><Drawer.Description
						>Parking availability, route, facilities, and reviews.</Drawer.Description
					></Drawer.Header
				>
				<div class="overflow-y-auto"><ParkingDetails id={activeId} /></div>
			</Drawer.Content>
		</Drawer.Root>
	{/if}
</main>
