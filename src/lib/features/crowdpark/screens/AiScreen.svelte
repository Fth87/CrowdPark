<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import BikeIcon from '@lucide/svelte/icons/bike';
	import CarFrontIcon from '@lucide/svelte/icons/car-front';
	import CheckIcon from '@lucide/svelte/icons/check';
	import CoinsIcon from '@lucide/svelte/icons/coins';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import XIcon from '@lucide/svelte/icons/x';
	import ZapIcon from '@lucide/svelte/icons/zap';
	import * as Alert from '$lib/components/ui/alert';
	import * as Drawer from '$lib/components/ui/drawer';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
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
	let insight = $state<{ narasi: string; lots: any[] } | null>(null);

	// Filter states
	let filterOpen = $state(false);
	let sortBy = $state<'spp' | 'distance' | 'slots' | 'rate'>('spp');
	let selectedStation = $state<string>('all');
	let minSlots = $state<number>(0);

	// Draft states for Drawer
	let draftSortBy = $state<'spp' | 'distance' | 'slots' | 'rate'>('spp');
	let draftSelectedStation = $state<string>('all');
	let draftMinSlots = $state<number>(0);
	let draftVehicle = $state('motorcycle');

	const quickDestinations = [
		'Stasiun Tugu',
		'Stasiun Lempuyangan',
		'Malioboro',
		'Pasar Kembang'
	];

	const hasActiveFilter = $derived(
		sortBy !== 'spp' || selectedStation !== 'all' || minSlots > 0
	);

	const handleSearch = async (forcedQuery?: string) => {
		const targetQuery = forcedQuery ?? (query.trim() || 'Stasiun Sekitar');
		if (forcedQuery) {
			query = forcedQuery;
		}
		searched = true;
		loading = true;
		insight = await fetchAiInsight(
			targetQuery,
			undefined,
			vehicle === 'car' ? 'mobil' : 'motor'
		);
		loading = false;
	};

	const openFilterDrawer = () => {
		draftSortBy = sortBy;
		draftSelectedStation = selectedStation;
		draftMinSlots = minSlots;
		draftVehicle = vehicle;
		filterOpen = true;
	};

	const applyFilter = () => {
		const vehicleChanged = draftVehicle !== vehicle;
		sortBy = draftSortBy;
		selectedStation = draftSelectedStation;
		minSlots = draftMinSlots;
		vehicle = draftVehicle;
		filterOpen = false;

		if (vehicleChanged || !searched) {
			handleSearch();
		}
	};

	const resetFilter = () => {
		draftSortBy = 'spp';
		draftSelectedStation = 'all';
		draftMinSlots = 0;
		sortBy = 'spp';
		selectedStation = 'all';
		minSlots = 0;
	};

	const processedLots = $derived(() => {
		if (!insight?.lots) return [];
		let list = [...insight.lots];

		// Filter stasiun / area
		if (selectedStation !== 'all') {
			const q = selectedStation.toLowerCase();
			list = list.filter((l) => {
				const name = (l.nama || '').toLowerCase();
				const type = (l.tipe || '').toLowerCase();
				if (q === 'tugu') return name.includes('tugu') || name.includes('utara') || name.includes('selatan');
				if (q === 'lempuyangan') return name.includes('lempuyangan');
				if (q === 'malioboro') return name.includes('malioboro') || name.includes('perwakilan') || type.includes('malioboro');
				return name.includes(q) || type.includes(q);
			});
		}

		// Filter minimal slot
		if (minSlots > 0) {
			list = list.filter((l) => (l.open_slots ?? l.kapasitas_motor ?? 0) >= minSlots);
		}

		// Urutkan
		if (sortBy === 'distance') {
			list.sort((a, b) => (a.durasi_detik ?? a.jarak_meter ?? 9999) - (b.durasi_detik ?? b.jarak_meter ?? 9999));
		} else if (sortBy === 'slots') {
			list.sort((a, b) => (b.open_slots ?? 0) - (a.open_slots ?? 0));
		} else if (sortBy === 'rate') {
			const extractRate = (val: any) => {
				if (typeof val === 'number') return val;
				if (typeof val === 'string') {
					const clean = val.replace(/[^0-9]/g, '');
					return clean ? parseInt(clean, 10) : 0;
				}
				return 0;
			};
			const isCar = vehicle === 'car';
			list.sort((a, b) => {
				const rateA = extractRate(isCar ? a.tarif_mobil : a.tarif_motor);
				const rateB = extractRate(isCar ? b.tarif_mobil : b.tarif_motor);
				return rateA - rateB;
			});
		}

		return list;
	});

	const sortLabels: Record<string, string> = {
		spp: 'Rekomendasi SPP',
		distance: 'Jarak Terdekat',
		slots: 'Slot Terbanyak',
		rate: 'Tarif Termurah'
	};

	const stationLabels: Record<string, string> = {
		all: 'Semua Area',
		tugu: 'Stasiun Tugu',
		lempuyangan: 'Stasiun Lempuyangan',
		malioboro: 'Malioboro'
	};
</script>

<svelte:head><title>Rekomendasi AI · CrowdPark</title></svelte:head>
<AppChrome active="ai" />
<MobileHeader title="Rekomendasi AI" eyebrow="Smart Parking" />

<main class="pb-mobile-nav min-h-[calc(100dvh-78px)] px-4 md:min-h-screen md:px-8 md:pt-16">
	<!-- Layout wrapper: terpusat saat hero, lebar responsif saat menampilkan hasil -->
	<div
		class="mx-auto w-full transition-all duration-300 {searched
			? 'max-w-5xl pt-4 md:pt-10'
			: 'max-w-[640px] pt-12 md:pt-28'}"
	>
		{#if !searched}
			<div class="mb-8 text-center">
				<div class="inline-flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand-strong shadow-xs ring-1 ring-brand/20">
					<SparklesIcon class="size-7" />
				</div>
				<h1 class="mt-4 text-2xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl">
					Cari Parkir Cerdas AI
				</h1>
				<p class="mx-auto mt-2 max-w-md text-sm text-muted-foreground md:text-base">
					Pilih lokasi tujuan. Algoritma SPP akan menganalisis ketersediaan slot, tarif, dan jarak jalan kaki optimal ke stasiun.
				</p>
			</div>
		{/if}

		<!-- Search Bar & Controls -->
		<div class="flex flex-col gap-3">
			<div class="w-full">
				<SearchControls
					bind:value={query}
					onsearch={() => handleSearch()}
					onfilter={openFilterDrawer}
					{hasActiveFilter}
					placeholder="Ketik stasiun atau destinasi (contoh: Stasiun Tugu)"
				/>
			</div>

			<div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
				<div class="w-full sm:w-auto">
					<VehicleToggle
						bind:value={vehicle}
						onchange={() => {
							if (searched) handleSearch();
						}}
					/>
				</div>

				{#if !searched}
					<!-- Saran Destinasi Cepat -->
					<div class="flex flex-wrap items-center justify-center gap-1.5 sm:justify-end">
						<span class="text-xs text-muted-foreground mr-1">Cepat:</span>
						{#each quickDestinations as dest}
							<button
								type="button"
								onclick={() => handleSearch(dest)}
								class="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-muted"
							>
								{dest}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Chip Filter Aktif -->
			{#if hasActiveFilter}
				<div class="mt-1 flex flex-wrap items-center gap-2">
					<span class="text-xs font-medium text-muted-foreground">Filter aktif:</span>

					{#if sortBy !== 'spp'}
						<Badge variant="secondary" class="gap-1.5 py-1 text-xs font-normal">
							<span>Urutan: {sortLabels[sortBy]}</span>
							<button
								type="button"
								onclick={() => (sortBy = 'spp')}
								class="rounded-full p-0.5 hover:bg-muted-foreground/20"
								aria-label="Hapus filter urutan"
							>
								<XIcon class="size-3" />
							</button>
						</Badge>
					{/if}

					{#if selectedStation !== 'all'}
						<Badge variant="secondary" class="gap-1.5 py-1 text-xs font-normal">
							<span>Area: {stationLabels[selectedStation]}</span>
							<button
								type="button"
								onclick={() => (selectedStation = 'all')}
								class="rounded-full p-0.5 hover:bg-muted-foreground/20"
								aria-label="Hapus filter stasiun"
							>
								<XIcon class="size-3" />
							</button>
						</Badge>
					{/if}

					{#if minSlots > 0}
						<Badge variant="secondary" class="gap-1.5 py-1 text-xs font-normal">
							<span>Min: {minSlots} Slot</span>
							<button
								type="button"
								onclick={() => (minSlots = 0)}
								class="rounded-full p-0.5 hover:bg-muted-foreground/20"
								aria-label="Hapus filter slot"
							>
								<XIcon class="size-3" />
							</button>
						</Badge>
					{/if}

					<button
						type="button"
						onclick={resetFilter}
						class="text-xs text-brand-strong hover:underline"
					>
						Reset Semua
					</button>
				</div>
			{/if}
		</div>

		<!-- Hasil Rekomendasi -->
		{#if searched}
			{#if loading}
				<div class="mt-16 flex flex-col items-center justify-center gap-3 py-12 text-brand">
					<SparklesIcon class="size-10 animate-pulse text-brand-strong" />
					<p class="text-sm font-medium text-muted-foreground">
						Menganalisis matriks SPP dan ketersediaan slot...
					</p>
				</div>
			{:else if insight}
				<!-- AI Insight Card -->
				<Alert.Root class="mt-6 border-brand/25 bg-brand/5 p-4 shadow-xs md:p-5">
					<div class="flex items-start gap-3">
						<div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand-strong">
							<SparklesIcon class="size-5" />
						</div>
						<div class="flex-1">
							<div class="flex items-center justify-between">
								<Alert.Title class="text-sm font-semibold text-brand-strong md:text-base">
									Analisis Rekomendasi AI
								</Alert.Title>
								<Badge variant="outline" class="border-brand/30 bg-background/50 text-[11px] text-brand-strong">
									Model SPP Terverifikasi
								</Badge>
							</div>
							<Alert.Description class="mt-2 text-sm leading-relaxed text-foreground/90">
								{insight.narasi}
							</Alert.Description>
						</div>
					</div>
				</Alert.Root>

				<!-- List Header & Bar Status -->
				<div class="mt-6 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
					<div class="flex items-center gap-2">
						<h2 class="text-base font-semibold text-foreground md:text-lg">
							Daftar Rekomendasi
						</h2>
						<Badge variant="secondary" class="text-xs font-normal">
							{processedLots().length} Lokasi Parkir
						</Badge>
					</div>
					<div class="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							class="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
							onclick={openFilterDrawer}
						>
							<SlidersHorizontalIcon class="size-3.5" />
							Filter & Urutan
						</Button>
						<Button
							variant="ghost"
							size="sm"
							class="h-8 gap-1 text-xs text-brand-strong hover:bg-brand/10"
							onclick={() => handleSearch()}
						>
							<SparklesIcon class="size-3" />
							Perbarui Data
						</Button>
					</div>
				</div>

				<!-- Grid Kartu Parkir Responsif di Desktop -->
				{#if processedLots().length > 0}
					<div class="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
						{#each processedLots() as lot, i (lot.id || i)}
							{@const isCar = vehicle === 'car'}
							{@const openSlotCount = lot.open_slots ?? (isCar ? (lot.kapasitas_mobil ? Math.floor(lot.kapasitas_mobil * 0.4) : 8) : (lot.kapasitas_motor ? Math.floor(lot.kapasitas_motor * 0.4) : 25))}
							{@const totalSlotCount = isCar ? (lot.kapasitas_mobil || 40) : (lot.kapasitas_motor || 150)}
							{@const spot = {
								...staticSpot,
								id: lot.id?.toString() || 'parkir-sample',
								name: lot.nama || 'Kantong Parkir',
								address: lot.tipe || 'Kawasan Parkir Stasiun',
								lat: lot.lat ?? -7.7889,
								lng: lot.lng ?? 110.3658,
								openSlots: openSlotCount,
								totalSlots: totalSlotCount,
								rate: isCar ? (lot.tarif_mobil || 'Rp 5.000') : (lot.tarif_motor || 'Rp 2.000'),
								driveMinutes: lot.durasi_detik ? Math.max(3, Math.ceil(lot.durasi_detik / 60) + 2) : 8,
								distanceKm: lot.jarak_meter ? Number((lot.jarak_meter / 1000).toFixed(1)) : 0.8,
								walkMinutes: lot.durasi_detik ? Math.max(1, Math.ceil(lot.durasi_detik / 60)) : 3,
								rating: 4.6,
								reviews: lot.n_observasi || 42,
								confidence: lot.confidence_level === 'tinggi' ? 95 : lot.confidence_level === 'sedang' ? 75 : 60
							}}
							<ParkingCard rank={i + 1} detailed {spot} />
						{/each}
					</div>
				{:else}
					<div class="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
						<SlidersHorizontalIcon class="size-8 text-muted-foreground/60" />
						<h3 class="mt-3 text-base font-medium text-foreground">Tidak Ada Lokasi yang Cocok</h3>
						<p class="mt-1 max-w-sm text-sm text-muted-foreground">
							Kriteria filter saat ini terlalu spesifik. Coba ubah atau reset kriteria filter untuk melihat rekomendasi lain.
						</p>
						<Button variant="outline" size="sm" class="mt-4 gap-1.5" onclick={resetFilter}>
							<RotateCcwIcon class="size-3.5" />
							Reset Filter
						</Button>
					</div>
				{/if}
			{:else}
				<div class="mt-12 text-center">
					<p class="text-sm text-muted-foreground">Rekomendasi belum tersedia. Coba cari lokasi lain.</p>
					<Button variant="outline" size="sm" class="mt-3" onclick={() => handleSearch('Stasiun Tugu')}>
						Cari Stasiun Tugu
					</Button>
				</div>
			{/if}
		{/if}
	</div>
</main>

<!-- Drawer Filter & Urutan -->
<Drawer.Root bind:open={filterOpen}>
	<Drawer.Content class="mx-auto max-w-xl">
		<Drawer.Header class="text-left">
			<div class="flex items-center justify-between">
				<Drawer.Title class="text-lg font-semibold">Filter Rekomendasi Parkir</Drawer.Title>
				<Button
					variant="ghost"
					size="sm"
					class="h-8 text-xs text-muted-foreground hover:text-foreground"
					onclick={resetFilter}
				>
					<RotateCcwIcon class="size-3 mr-1" />
					Reset
				</Button>
			</div>
			<Drawer.Description class="text-xs text-muted-foreground">
				Sesuaikan kriteria prioritas algoritma SPP dan batas pencarian lokasi.
			</Drawer.Description>
		</Drawer.Header>

		<div class="max-h-[70vh] space-y-6 overflow-y-auto px-4 py-2">
			<!-- Opsi Urutan -->
			<div>
				<p class="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Prioritas Urutan
				</p>
				<div class="mt-2.5 grid grid-cols-2 gap-2">
					<button
						type="button"
						onclick={() => (draftSortBy = 'spp')}
						class="flex flex-col items-start rounded-xl border p-3 text-left transition-all {draftSortBy === 'spp'
							? 'border-primary bg-primary/5 ring-1 ring-primary'
							: 'border-border bg-background hover:bg-muted'}"
					>
						<div class="flex w-full items-center justify-between">
							<ZapIcon class="size-4 text-primary" />
							{#if draftSortBy === 'spp'}<CheckIcon class="size-4 text-primary" />{/if}
						</div>
						<span class="mt-2 text-xs font-semibold text-foreground">Rekomendasi SPP</span>
						<span class="text-[11px] text-muted-foreground">Skor cerdas multi kriteria</span>
					</button>

					<button
						type="button"
						onclick={() => (draftSortBy = 'distance')}
						class="flex flex-col items-start rounded-xl border p-3 text-left transition-all {draftSortBy === 'distance'
							? 'border-primary bg-primary/5 ring-1 ring-primary'
							: 'border-border bg-background hover:bg-muted'}"
					>
						<div class="flex w-full items-center justify-between">
							<MapPinIcon class="size-4 text-primary" />
							{#if draftSortBy === 'distance'}<CheckIcon class="size-4 text-primary" />{/if}
						</div>
						<span class="mt-2 text-xs font-semibold text-foreground">Jarak Terdekat</span>
						<span class="text-[11px] text-muted-foreground">Waktu jalan kaki tersingkat</span>
					</button>

					<button
						type="button"
						onclick={() => (draftSortBy = 'slots')}
						class="flex flex-col items-start rounded-xl border p-3 text-left transition-all {draftSortBy === 'slots'
							? 'border-primary bg-primary/5 ring-1 ring-primary'
							: 'border-border bg-background hover:bg-muted'}"
					>
						<div class="flex w-full items-center justify-between">
							<SparklesIcon class="size-4 text-primary" />
							{#if draftSortBy === 'slots'}<CheckIcon class="size-4 text-primary" />{/if}
						</div>
						<span class="mt-2 text-xs font-semibold text-foreground">Slot Terbanyak</span>
						<span class="text-[11px] text-muted-foreground">Paling lengang & mudah dapat</span>
					</button>

					<button
						type="button"
						onclick={() => (draftSortBy = 'rate')}
						class="flex flex-col items-start rounded-xl border p-3 text-left transition-all {draftSortBy === 'rate'
							? 'border-primary bg-primary/5 ring-1 ring-primary'
							: 'border-border bg-background hover:bg-muted'}"
					>
						<div class="flex w-full items-center justify-between">
							<CoinsIcon class="size-4 text-primary" />
							{#if draftSortBy === 'rate'}<CheckIcon class="size-4 text-primary" />{/if}
						</div>
						<span class="mt-2 text-xs font-semibold text-foreground">Tarif Termurah</span>
						<span class="text-[11px] text-muted-foreground">Biaya parkir paling hemat</span>
					</button>
				</div>
			</div>

			<Separator />

			<!-- Opsi Area / Stasiun -->
			<div>
				<p class="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Kawasan / Stasiun Tujuan
				</p>
				<div class="mt-2.5 grid grid-cols-2 gap-2">
					{#each [{ id: 'all', label: 'Semua Kawasan' }, { id: 'tugu', label: 'Stasiun Tugu' }, { id: 'lempuyangan', label: 'Stasiun Lempuyangan' }, { id: 'malioboro', label: 'Malioboro' }] as area}
						<button
							type="button"
							onclick={() => (draftSelectedStation = area.id)}
							class="flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-xs transition-all {draftSelectedStation === area.id
								? 'border-primary bg-primary/5 font-semibold text-primary ring-1 ring-primary'
								: 'border-border bg-background text-foreground hover:bg-muted'}"
						>
							<span>{area.label}</span>
							{#if draftSelectedStation === area.id}<CheckIcon class="size-3.5 text-primary" />{/if}
						</button>
					{/each}
				</div>
			</div>

			<Separator />

			<!-- Jenis Kendaraan -->
			<div>
				<p class="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Jenis Kendaraan
				</p>
				<div class="mt-2.5 grid grid-cols-2 gap-2">
					<button
						type="button"
						onclick={() => (draftVehicle = 'motorcycle')}
						class="flex items-center gap-2 rounded-xl border p-3 transition-all {draftVehicle === 'motorcycle'
							? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
							: 'border-border bg-background text-foreground hover:bg-muted'}"
					>
						<BikeIcon class="size-4" />
						<span class="text-xs font-medium">Sepeda Motor</span>
					</button>
					<button
						type="button"
						onclick={() => (draftVehicle = 'car')}
						class="flex items-center gap-2 rounded-xl border p-3 transition-all {draftVehicle === 'car'
							? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
							: 'border-border bg-background text-foreground hover:bg-muted'}"
					>
						<CarFrontIcon class="size-4" />
						<span class="text-xs font-medium">Mobil</span>
					</button>
				</div>
			</div>

			<Separator />

			<!-- Minimal Slot Tersedia -->
			<div>
				<p class="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Ketersediaan Slot Minimum
				</p>
				<div class="mt-2.5 flex flex-wrap gap-2">
					{#each [{ val: 0, label: 'Semua' }, { val: 5, label: '> 5 Slot' }, { val: 15, label: '> 15 Slot' }, { val: 30, label: '> 30 Slot' }] as opt}
						<button
							type="button"
							onclick={() => (draftMinSlots = opt.val)}
							class="rounded-full border px-3 py-1.5 text-xs transition-all {draftMinSlots === opt.val
								? 'border-primary bg-primary text-primary-foreground font-medium'
								: 'border-border bg-background text-foreground hover:bg-muted'}"
						>
							{opt.label}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<Drawer.Footer class="border-t border-border/80 pt-4">
			<Button class="w-full" onclick={applyFilter}>
				Terapkan Filter
			</Button>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
