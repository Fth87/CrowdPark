<script lang="ts">
	import { onMount } from 'svelte';
	import AppChrome from '../components/AppChrome.svelte';
	import MobileHeader from '../components/MobileHeader.svelte';
	import ParkingCard from '../components/ParkingCard.svelte';
	import { fetchSavedSpots } from '../api';
	import type { ParkingSpot } from '../types';

	let spots = $state<ParkingSpot[]>([]);
	let loaded = $state(false);

	onMount(async () => {
		spots = await fetchSavedSpots();
		loaded = true;
	});
</script>

<svelte:head><title>Saved Spots · CrowdPark</title></svelte:head>
<AppChrome active="saved" />
<MobileHeader />
<main
	class="pb-mobile-nav mx-auto max-w-[1000px] px-4 pt-2 md:grid md:min-h-screen md:grid-cols-2 md:gap-6 md:px-10 md:pt-28"
>
	<h1 class="sr-only">Saved parking spots</h1>
	{#if spots.length > 0}
		{#each spots as spot (spot.id)}
			<ParkingCard saved {spot} />
		{/each}
	{:else}
		<ParkingCard saved />
		<div class="mt-4 md:mt-0"><ParkingCard saved /></div>
	{/if}
</main>
