<script lang="ts">
	import { onMount } from 'svelte';
	import PlusCircleIcon from '@lucide/svelte/icons/circle-plus';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
	import * as Card from '$lib/components/ui/card';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Drawer from '$lib/components/ui/drawer';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import AppChrome from '../components/AppChrome.svelte';
	import MobileHeader from '../components/MobileHeader.svelte';
	import { fetchVehicles, upsertVehicle, setActiveVehicle } from '../api';

	type Vehicle = {
		id: number;
		nama: string;
		tipe: 'motor' | 'mobil';
		plat: string;
		is_active: boolean;
	};

	let vehicles = $state<Vehicle[]>([]);
	let loading = $state(true);
	let activeId = $state<number | null>(null);
	let dialogOpen = $state(false);
	let editTarget = $state<Partial<Vehicle> | null>(null);
	let saving = $state(false);
	let errorMsg = $state('');

	// Form state
	let formNama = $state('');
	let formTipe = $state<'motor' | 'mobil'>('motor');
	let formPlat = $state('');

	const MAX_SLOTS = 5;

	onMount(async () => {
		await loadVehicles();
	});

	async function loadVehicles() {
		loading = true;
		const { data } = await fetchVehicles();
		vehicles = data as Vehicle[];
		const current = vehicles.find((v) => v.is_active);
		if (current) activeId = current.id;
		loading = false;
	}

	async function handleSetActive(id: number) {
		activeId = id;
		await setActiveVehicle(id);
		vehicles = vehicles.map((v) => ({ ...v, is_active: v.id === id }));
	}

	function openAdd() {
		editTarget = null;
		formNama = '';
		formTipe = 'motor';
		formPlat = '';
		errorMsg = '';
		dialogOpen = true;
	}

	function openEdit(v: Vehicle) {
		editTarget = v;
		formNama = v.nama;
		formTipe = v.tipe;
		formPlat = v.plat;
		errorMsg = '';
		dialogOpen = true;
	}

	async function handleSave() {
		if (!formNama.trim() || !formPlat.trim()) {
			errorMsg = 'Nama dan nomor plat wajib diisi.';
			return;
		}
		saving = true;
		errorMsg = '';
		const payload = {
			id: editTarget?.id,
			nama: formNama.trim(),
			tipe: formTipe,
			plat: formPlat.trim().toUpperCase(),
			is_active: editTarget?.is_active ?? false
		};
		const { error } = await upsertVehicle(payload);
		saving = false;
		if (error) {
			errorMsg = typeof error === 'string' ? error : 'Gagal menyimpan kendaraan.';
			return;
		}
		dialogOpen = false;
		await loadVehicles();
	}

	const tipeIcon = (tipe: string) => (tipe === 'motor' ? '🏍️' : '🚗');
</script>

<svelte:head><title>Manage Vehicle · CrowdPark</title></svelte:head>
<AppChrome active="profile" />
<MobileHeader title="Manage Vehicle" eyebrow="CrowdPark" backHref="/profile" />
<main class="pb-mobile-nav mx-auto max-w-[760px] px-4 pt-6 md:min-h-screen md:pt-28">
	<div
		class="mb-3 flex items-center justify-between px-1 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground"
	>
		<span>Registered Fleet</span>
		<span class="text-primary">{vehicles.length} of {MAX_SLOTS} Slots</span>
	</div>

	{#if loading}
		<p class="px-1 text-sm text-muted-foreground">Memuat kendaraan...</p>
	{:else if vehicles.length === 0}
		<Card.Root size="sm" class="border-dashed text-center [--card-spacing:--spacing(6)]">
			<Card.Content>
				<p class="text-muted-foreground">Belum ada kendaraan terdaftar.</p>
				<p class="mt-1 text-xs text-muted-foreground">Tambahkan kendaraan pertamamu.</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<RadioGroup.Root value={String(activeId)}>
			{#each vehicles as vehicle (vehicle.id)}
				<label for={String(vehicle.id)}>
					<Card.Root
						size="sm"
						class="cursor-pointer [--card-spacing:--spacing(4)] {activeId === vehicle.id
							? 'ring-2 ring-primary'
							: ''}"
					>
						<Card.Header class="flex-row items-start">
							<RadioGroup.Item
								value={String(vehicle.id)}
								id={String(vehicle.id)}
								onclick={() => handleSetActive(vehicle.id)}
							/>
							<div class="flex-1">
								<div class="flex items-center justify-between">
									<Card.Title>{tipeIcon(vehicle.tipe)} {vehicle.nama}</Card.Title>
									{#if activeId === vehicle.id}<Badge>✓ Active</Badge>{/if}
								</div>
								<Card.Description class="mt-2">
									<b class="rounded bg-secondary px-3 py-1 tracking-[0.12em]">{vehicle.plat}</b
									>　{vehicle.tipe}
								</Card.Description>
							</div>
						</Card.Header>
						<Separator />
						<Card.Footer class="justify-between">
							<span class={activeId === vehicle.id ? 'text-success' : 'text-muted-foreground'}>
								{activeId === vehicle.id ? 'Station Gate Ready' : 'Klik untuk aktifkan'}
							</span>
							<Button variant="secondary" size="sm" onclick={() => openEdit(vehicle)}>
								<PencilIcon />Edit
							</Button>
						</Card.Footer>
					</Card.Root>
				</label>
			{/each}
		</RadioGroup.Root>
	{/if}

	<Button
		class="mt-4 h-12 w-full shadow-brand"
		disabled={vehicles.length >= MAX_SLOTS}
		onclick={openAdd}
	>
		<PlusCircleIcon />
		{vehicles.length >= MAX_SLOTS ? 'Slot penuh (maks 5)' : 'Add New Vehicle'}
	</Button>
</main>

<!-- Drawer Add / Edit -->
<Drawer.Root bind:open={dialogOpen}>
	<Drawer.Content class="px-4 pb-4">
		<Drawer.Header class="px-0 text-left">
			<Drawer.Title>{editTarget ? 'Edit Kendaraan' : 'Tambah Kendaraan'}</Drawer.Title>
		</Drawer.Header>

		<div class="flex flex-col gap-4 py-2">
			<!-- Nama -->
			<div class="flex flex-col gap-1.5">
				<label class="text-sm font-medium" for="v-nama">Nama kendaraan</label>
				<input
					id="v-nama"
					bind:value={formNama}
					placeholder="Contoh: Honda Beat, Agya"
					class="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
				/>
			</div>

			<!-- Tipe -->
			<div class="flex flex-col gap-1.5">
				<span class="text-sm font-medium">Jenis kendaraan</span>
				<div class="flex gap-2">
					{#each ['motor', 'mobil'] as t}
						<button
							type="button"
							onclick={() => (formTipe = t as 'motor' | 'mobil')}
							class="flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition {formTipe ===
							t
								? 'border-primary bg-primary/10 text-primary'
								: 'border-border text-muted-foreground'}"
						>
							{tipeIcon(t)}
							{t === 'motor' ? 'Motor' : 'Mobil'}
						</button>
					{/each}
				</div>
			</div>

			<!-- Plat -->
			<div class="flex flex-col gap-1.5">
				<label class="text-sm font-medium" for="v-plat">Nomor plat</label>
				<input
					id="v-plat"
					bind:value={formPlat}
					placeholder="Contoh: AB 1234 CD"
					class="h-10 w-full rounded-md border border-border bg-background px-3 font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-primary/30"
				/>
			</div>

			{#if errorMsg}
				<p class="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMsg}</p>
			{/if}
		</div>

		<Drawer.Footer class="gap-2 px-0 pt-4 flex-row">
			<Button variant="outline" class="flex-1" onclick={() => (dialogOpen = false)}>
				Batal
			</Button>
			<Button onclick={handleSave} disabled={saving} class="shadow-brand flex-1">
				{saving ? 'Menyimpan...' : 'Simpan'}
			</Button>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
