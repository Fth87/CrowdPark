<script lang="ts">
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import * as Alert from '$lib/components/ui/alert';
	import AppChrome from '../components/AppChrome.svelte';
	import MobileHeader from '../components/MobileHeader.svelte';
	import ParkingCard from '../components/ParkingCard.svelte';
	import SearchControls from '../components/SearchControls.svelte';
	import VehicleToggle from '../components/VehicleToggle.svelte';
	let query = $state('');
	let vehicle = $state('motorcycle');
	let searched = $state(false);
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
			<div class="md:mx-auto md:max-w-[358px]"><VehicleToggle bind:value={vehicle} /></div>
			<div class="md:mx-auto md:max-w-[580px]">
				<SearchControls bind:value={query} onsearch={() => (searched = true)} />
			</div>
		</div>
		{#if searched}
			<Alert.Root class="mt-5"
				><SparklesIcon /><Alert.Title>AI Insight</Alert.Title><Alert.Description
					>Currently, Parkir Timur Lempuyangan is your best choice (~15 slots, 3 min walk). Parkir
					Swadaya B is the best backup option if filled.</Alert.Description
				></Alert.Root
			>
			<div class="mt-4 flex flex-col gap-4">
				{#each [1, 2, 3] as rank}<ParkingCard {rank} />{/each}
			</div>
		{/if}
	</div>
</main>
