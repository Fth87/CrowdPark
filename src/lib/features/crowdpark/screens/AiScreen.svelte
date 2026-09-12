<script lang="ts">
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import AppChrome from '../components/AppChrome.svelte';
	import MobileHeader from '../components/MobileHeader.svelte';
	import ParkingCard from '../components/ParkingCard.svelte';
	import SearchControls from '../components/SearchControls.svelte';
	import VehicleToggle from '../components/VehicleToggle.svelte';
	import { fetchAiInsight } from '../api';
	import { parkingSpot as staticSpot } from '../data';

	let query = $state('');
	let vehicle = $state('motorcycle');
	let searched = $state(false);
	let loading = $state(false);
	let insight = $state<{narasi: string, lots: any[]} | null>(null);

	const handleSearch = async () => {
		if (!query.trim()) return;
		searched = true;
		loading = true;
		insight = await fetchAiInsight(query);
		loading = false;
	};
</script>

<svelte:head><title>AI Recommendations · CrowdPark</title></svelte:head>
<AppChrome active="ai" />
<MobileHeader />
<main
	class="pb-mobile-nav min-h-[calc(100dvh-78px)] px-3 pt-[250px] md:min-h-screen md:px-0 md:pt-16"
>
	<div class:pt-16={searched} class:pt-28={!searched} class="mx-auto w-full max-w-[620px] md:pt-44">
		{#if !searched}<h1
				class="mb-7 text-center text-xl font-medium tracking-[-0.04em] md:text-[36px]"
			>
				Find Parking Spot Nearby
			</h1>{/if}
		<div class="flex flex-col gap-3 px-1 md:px-0">
			<div class="md:mx-auto md:w-[580px] max-w-full">
				<SearchControls bind:value={query} onsearch={handleSearch} />
			</div>
			<div class="md:mx-auto md:w-[358px] max-w-full"><VehicleToggle bind:value={vehicle} /></div>
		</div>
		{#if searched}
			{#if loading}
				<div class="mt-20 flex justify-center text-brand"><SparklesIcon class="animate-pulse size-10" /></div>
			{:else if insight}
				<Alert.Root class="mt-5 border-brand/20 bg-brand/5 pb-4"
					><SparklesIcon class="text-brand-strong" /><Alert.Title class="text-brand-strong">AI Insight</Alert.Title><Alert.Description class="text-muted-foreground"
						>{insight.narasi}</Alert.Description
					></Alert.Root
				>
				<div class="mt-4 flex items-center justify-between px-1">
					<h2 class="text-sm font-semibold text-muted-foreground">Top Recommendations</h2>
					<Button variant="ghost" size="sm" class="h-8 text-xs text-brand-strong" onclick={handleSearch}>
						<SparklesIcon class="size-3 mr-1" /> Update Data
					</Button>
				</div>
				<div class="mt-2 flex flex-col gap-4">
					{#each insight.lots as lot, i}
						{@const spot = { ...staticSpot, name: lot.nama, address: lot.tipe, openSlots: Math.floor(lot.estimasi_motor_pct ? lot.estimasi_motor_pct : 15), rate: lot.tarif_motor, confidence: lot.confidence_level === 'tinggi' ? 95 : 60 }}
						<ParkingCard rank={i+1} detailed spot={spot} />
					{/each}
				</div>
			{:else}
				<p class="mt-10 text-center text-muted-foreground">Insight unavailable. Please try again.</p>
			{/if}
		{/if}
	</div>
</main>
