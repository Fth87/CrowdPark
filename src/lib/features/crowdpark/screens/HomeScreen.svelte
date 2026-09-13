<script lang="ts">
	import TrainFrontIcon from '@lucide/svelte/icons/train-front';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import AppChrome from '../components/AppChrome.svelte';
	import MapCanvas from '../components/MapCanvas.svelte';
	import MobileHeader from '../components/MobileHeader.svelte';
	import SearchControls from '../components/SearchControls.svelte';
	import VehicleToggle from '../components/VehicleToggle.svelte';
	import { station } from '../data';

	import { goto } from '$app/navigation';

	let query = $state('');
	let vehicle = $state('motorcycle');
	let searchOpen = $state(false);

	const STATIONS = [
		{
			name: 'Stasiun Yogyakarta (Tugu)',
			address: 'Jl. Pasar Kembang, Sosromenduran, Gedong Tengen, Yogyakarta'
		},
		{
			name: 'Stasiun Lempuyangan',
			address: 'Bausasran, Danurejan, Kota Yogyakarta'
		},
		{
			name: 'Kawasan Malioboro',
			address: 'Sosromenduran, Gedong Tengen, Kota Yogyakarta'
		}
	];

	const submit = () => {
		const targetQuery = query.trim() || 'Stasiun Yogyakarta';
		goto(`/maps?q=${encodeURIComponent(targetQuery)}&vehicle=${vehicle}`);
	};

	const selectStation = (name: string) => {
		query = name;
		searchOpen = false;
		goto(`/maps?q=${encodeURIComponent(name)}&vehicle=${vehicle}`);
	};
</script>

<svelte:head
	><title>Home · CrowdPark</title><meta
		name="description"
		content="Find the best parking spot near your destination."
	/></svelte:head
>
<AppChrome active="home" />
<MobileHeader />
<main class="pb-mobile-nav md:flex md:h-screen md:pt-16">
	<aside class="page-pad z-10 flex flex-col gap-4 bg-background md:w-[438px] md:shrink-0 md:py-8">
		<h1 class="hidden text-xl font-medium tracking-[-0.04em] md:block">Find your destination</h1>
		<SearchControls bind:value={query} onsearch={submit} onfocus={() => (searchOpen = true)} />
		<VehicleToggle bind:value={vehicle} />
		{#if searchOpen}
			<Card.Root class="min-h-[366px] [--card-spacing:--spacing(5)]">
				<Card.Header><Card.Title>Pilih Destinasi Stasiun</Card.Title></Card.Header>
				<Card.Content class="flex flex-col">
					{#each STATIONS as st, index}
						<Button
							variant="ghost"
							onclick={() => selectStation(st.name)}
							class="h-auto justify-start rounded-none py-3"
						>
							<TrainFrontIcon class="size-5 shrink-0 text-primary" />
							<span class="text-left">
								<b class="block text-foreground">{st.name}</b>
								<small class="block max-w-64 truncate text-muted-foreground">{st.address}</small>
							</span>
						</Button>
						{#if index < STATIONS.length - 1}<Separator />{/if}
					{/each}
				</Card.Content>
				<Card.Footer class="mt-auto justify-center">
					<Button variant="link" onclick={() => (searchOpen = false)}>Tutup pencarian</Button>
				</Card.Footer>
			</Card.Root>

		{:else}
			<Card.Root class="gap-0 py-0"
				><Card.Content class="p-0"
					><div class="h-[300px]">
						<MapCanvas mode="location" interactive={false} />
					</div></Card.Content
				><Card.Footer class="block p-3"
					><b>Current Location</b>
					<p class="text-sm text-muted-foreground">
						Jl. Gowongan Lor, No. 43, Yogyakarta.
					</p></Card.Footer
				></Card.Root
			>
			<Button
				onclick={submit}
				size="lg"
				class="mt-auto h-14 rounded-[22px] text-base"
				>Find Parking Spot</Button
			>
		{/if}
	</aside>
	<div class="hidden flex-1 md:block"><MapCanvas mode="location" /></div>
</main>
