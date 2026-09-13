<script lang="ts">
	import BookmarkIcon from '@lucide/svelte/icons/bookmark';
	import CompassIcon from '@lucide/svelte/icons/compass';
	import SearchIcon from '@lucide/svelte/icons/search';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import { onMount } from 'svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import AppChrome from '../components/AppChrome.svelte';
	import MobileHeader from '../components/MobileHeader.svelte';
	import ParkingCard from '../components/ParkingCard.svelte';
	import { fetchSavedSpots } from '../api';
	import type { ParkingSpot } from '../types';

	let spots = $state<ParkingSpot[]>([]);
	let loaded = $state(false);
	let searchQuery = $state('');

	onMount(async () => {
		spots = await fetchSavedSpots();
		loaded = true;
	});

	const filteredSpots = $derived(() => {
		if (!searchQuery.trim()) return spots;
		const q = searchQuery.toLowerCase();
		return spots.filter(
			(s) =>
				s.name.toLowerCase().includes(q) ||
				(s.address && s.address.toLowerCase().includes(q))
		);
	});
</script>

<svelte:head><title>Lokasi Tersimpan · CrowdPark</title></svelte:head>
<AppChrome active="saved" />
<MobileHeader title="Lokasi Tersimpan" eyebrow="Favorit" />

<main class="pb-mobile-nav min-h-[calc(100dvh-78px)] px-4 md:min-h-screen md:px-8 md:pt-24 md:pb-16">
	<div class="mx-auto max-w-7xl">
		<!-- Desktop Header & Subtitle -->
		<div class="hidden md:flex md:items-end md:justify-between md:border-b md:border-border/60 md:pb-6">
			<div>
				<div class="flex items-center gap-3">
					<div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
						<BookmarkIcon class="size-5" />
					</div>
					<div>
						<div class="flex items-center gap-2">
							<h1 class="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
								Lokasi Parkir Tersimpan
							</h1>
							{#if loaded}
								<Badge variant="secondary" class="font-medium text-xs">
									{spots.length} Lokasi
								</Badge>
							{/if}
						</div>
						<p class="mt-1 text-sm text-muted-foreground">
							Akses cepat ke kantong parkir pilihan Anda di sekitar kawasan stasiun dan Malioboro.
						</p>
					</div>
				</div>
			</div>

			<div class="flex items-center gap-3">
				{#if spots.length > 2}
					<div class="relative w-64">
						<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							bind:value={searchQuery}
							placeholder="Cari lokasi tersimpan..."
							class="h-9 pl-9 text-xs"
						/>
					</div>
				{/if}
				<Button href="/maps" variant="outline" size="sm" class="gap-1.5 text-xs">
					<CompassIcon class="size-3.5" />
					Buka Peta
				</Button>
				<Button href="/ai" size="sm" class="gap-1.5 text-xs">
					<SparklesIcon class="size-3.5" />
					Cari via AI
				</Button>
			</div>
		</div>

		<!-- Mobile Search (jika ada lebih dari 2 spot) -->
		{#if loaded && spots.length > 2}
			<div class="mt-2 mb-4 md:hidden">
				<div class="relative">
					<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						bind:value={searchQuery}
						placeholder="Cari lokasi tersimpan..."
						class="h-10 pl-9 text-sm"
					/>
				</div>
			</div>
		{/if}

		<!-- Content Area -->
		<div class="mt-4 md:mt-8">
			{#if !loaded}
				<!-- Skeleton Loading Grid -->
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each [1, 2, 3] as _}
						<div class="h-64 animate-pulse rounded-2xl border border-border/80 bg-muted/40 p-5">
							<div class="flex items-center justify-between">
								<div class="h-6 w-24 rounded-full bg-muted"></div>
								<div class="size-6 rounded-full bg-muted"></div>
							</div>
							<div class="mt-4 h-5 w-3/4 rounded-md bg-muted"></div>
							<div class="mt-2 h-4 w-1/2 rounded-md bg-muted"></div>
							<div class="mt-8 h-4 w-full rounded-md bg-muted"></div>
							<div class="mt-6 flex gap-3">
								<div class="h-9 flex-1 rounded-md bg-muted"></div>
								<div class="h-9 flex-1 rounded-md bg-muted"></div>
							</div>
						</div>
					{/each}
				</div>
			{:else if spots.length === 0}
				<!-- Empty State yang Menarik -->
				<div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center shadow-xs md:py-24">
					<div class="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
						<BookmarkIcon class="size-8" />
					</div>
					<h2 class="mt-5 text-lg font-semibold text-foreground md:text-xl">
						Belum Ada Lokasi Tersimpan
					</h2>
					<p class="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
						Tandai kantong parkir favorit saat menjelajahi peta atau menggunakan rekomendasi AI agar dapat diakses kembali dengan cepat.
					</p>
					<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
						<Button href="/maps" class="gap-1.5">
							<CompassIcon class="size-4" />
							Jelajahi Peta Parkir
						</Button>
						<Button href="/ai" variant="outline" class="gap-1.5">
							<SparklesIcon class="size-4 text-brand-strong" />
							Rekomendasi Cerdas AI
						</Button>
					</div>
				</div>
			{:else if filteredSpots().length === 0}
				<!-- Search empty state -->
				<div class="py-16 text-center">
					<p class="text-sm text-muted-foreground">
						Tidak ada lokasi tersimpan dengan kata kunci "{searchQuery}".
					</p>
					<Button variant="ghost" size="sm" class="mt-2 text-xs" onclick={() => (searchQuery = '')}>
						Hapus Kata Kunci
					</Button>
				</div>
			{:else}
				<!-- Responsive Desktop Card Grid: 1 col mobile, 2 col tablet, 3 col desktop -->
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each filteredSpots() as spot (spot.id)}
						<div class="flex flex-col">
							<ParkingCard saved {spot} />
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</main>
