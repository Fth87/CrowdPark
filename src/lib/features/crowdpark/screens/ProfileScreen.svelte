<script lang="ts">
	import BikeIcon from '@lucide/svelte/icons/bike';
	import BookmarkIcon from '@lucide/svelte/icons/bookmark';
	import CarFrontIcon from '@lucide/svelte/icons/car-front';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import CircleHelpIcon from '@lucide/svelte/icons/circle-help';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import InfoIcon from '@lucide/svelte/icons/info';
	import KeyRoundIcon from '@lucide/svelte/icons/key-round';
	import LockIcon from '@lucide/svelte/icons/lock';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import StarIcon from '@lucide/svelte/icons/star';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Card from '$lib/components/ui/card';
	import * as Drawer from '$lib/components/ui/drawer';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import AppChrome from '../components/AppChrome.svelte';
	import MobileHeader from '../components/MobileHeader.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		signOut,
		fetchVehicles,
		fetchSavedSpots,
		getSupabase
	} from '$lib/features/crowdpark/api';
	import { onMount } from 'svelte';

	// Session claims
	const claims = $derived((page.data as any)?.claims);
	const userEmail = $derived(claims?.email ?? 'pengguna@crowdpark.id');
	let displayedName = $state('');
	const userName = $derived(
		displayedName || claims?.user_metadata?.full_name || userEmail.split('@')[0]
	);
	const userAvatar = $derived(claims?.user_metadata?.avatar_url ?? null);

	// Real data states
	let userVehicles = $state<any[]>([]);
	let savedSpotsCount = $state(0);
	let userReviewsCount = $state(0);
	let loadingData = $state(true);

	// Drawers
	let methodologyOpen = $state(false);
	let editNameOpen = $state(false);
	let newNameInput = $state('');
	let savingName = $state(false);

	const activeVehicle = $derived(
		userVehicles.find((v) => v.is_active) || userVehicles[0] || null
	);

	onMount(async () => {
		displayedName = claims?.user_metadata?.full_name || '';
		newNameInput = userName;

		try {
			const [vehRes, savedSpots] = await Promise.all([
				fetchVehicles(),
				fetchSavedSpots()
			]);
			userVehicles = vehRes.data || [];
			savedSpotsCount = (savedSpots || []).length;

			// Count user reviews
			const userId = claims?.sub || claims?.id;
			if (userId) {
				const { count } = await getSupabase()
					.from('parking_reviews')
					.select('id', { count: 'exact', head: true })
					.eq('user_id', userId);
				userReviewsCount = count ?? 0;
			}
		} catch (err) {
			console.error('[ProfileScreen] error loading data', err);
		} finally {
			loadingData = false;
		}
	});

	const logout = async () => {
		await signOut();
		goto('/login');
	};

	async function handleSaveName() {
		if (!newNameInput.trim()) return;
		savingName = true;
		try {
			await getSupabase().auth.updateUser({
				data: { full_name: newNameInput.trim() }
			});
			displayedName = newNameInput.trim();
			editNameOpen = false;
		} catch (err) {
			console.error(err);
		} finally {
			savingName = false;
		}
	}
</script>

<svelte:head><title>Profil Akun · CrowdPark</title></svelte:head>
<AppChrome active="profile" />
<MobileHeader />

<main
	class="pb-mobile-nav mx-auto flex max-w-[1080px] flex-col gap-5 px-4 pt-20 md:grid md:min-h-screen md:grid-cols-12 md:items-start md:gap-6 md:px-8 md:pt-24"
>
	<!-- LEFT COLUMN: Profile info, stats, and primary vehicle -->
	<div class="flex flex-col gap-5 md:col-span-5">
		<!-- Profile Card -->
		<Card.Root class="overflow-hidden border-border/80 shadow-sm">
			<Card.Header class="flex flex-col items-center pb-4 text-center">
				<div class="relative">
					<Avatar.Root class="size-20 border-4 border-background shadow-md">
						<Avatar.Image src={userAvatar ?? '/images/crowdpark/profile.png'} alt="Foto Profil" />
						<Avatar.Fallback class="bg-primary/10 text-lg font-bold text-primary">
							{userName.slice(0, 2).toUpperCase()}
						</Avatar.Fallback>
					</Avatar.Root>
					<button
						type="button"
						onclick={() => {
							newNameInput = userName;
							editNameOpen = true;
						}}
						aria-label="Ubah nama profil"
						class="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition hover:scale-110"
					>
						<PencilIcon class="size-3.5" />
					</button>
				</div>

				<Card.Title class="mt-3 text-lg font-bold tracking-tight text-foreground">
					{userName}
				</Card.Title>
				<Card.Description class="flex flex-wrap items-center justify-center gap-1.5 text-xs">
					<span class="text-muted-foreground">{userEmail}</span>
					<Badge variant="secondary" class="h-5 px-1.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 border-emerald-200">
						Terverifikasi
					</Badge>
				</Card.Description>
			</Card.Header>

			<!-- Quick Stats Strip -->
			<div class="grid grid-cols-3 border-t border-border/60 bg-muted/30 py-3 text-center">
				<div class="border-r border-border/50 px-2">
					<span class="block text-base font-bold text-foreground">{userVehicles.length}</span>
					<span class="text-[11px] text-muted-foreground">Kendaraan</span>
				</div>
				<div class="border-r border-border/50 px-2">
					<span class="block text-base font-bold text-foreground">{savedSpotsCount}</span>
					<span class="text-[11px] text-muted-foreground">Tersimpan</span>
				</div>
				<div class="px-2">
					<span class="block text-base font-bold text-foreground">{userReviewsCount}</span>
					<span class="text-[11px] text-muted-foreground">Ulasan</span>
				</div>
			</div>
		</Card.Root>

		<!-- Primary Vehicle Card -->
		<Card.Root class="border-border/80 shadow-sm">
			<Card.Header class="pb-3">
				<div class="flex items-center justify-between">
					<div>
						<Card.Title class="text-base font-semibold">Kendaraan Utama</Card.Title>
						<Card.Description class="text-xs">Digunakan untuk estimasi tarif & ketersediaan slot</Card.Description>
					</div>
					<Button
						href="/profile/vehicles"
						variant="ghost"
						size="icon-sm"
						aria-label="Kelola semua kendaraan"
					>
						<ChevronRightIcon class="size-4" />
					</Button>
				</div>
			</Card.Header>
			<Card.Content class="pt-0">
				{#if activeVehicle}
					<div class="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3.5">
						<div class="flex items-center gap-3">
							<div class="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
								{#if activeVehicle.tipe === 'mobil'}
									<CarFrontIcon class="size-5" />
								{:else}
									<BikeIcon class="size-5" />
								{/if}
							</div>
							<div>
								<b class="block text-sm font-semibold text-foreground">{activeVehicle.nama}</b>
								<small class="text-xs text-muted-foreground">
									{activeVehicle.tipe === 'mobil' ? 'Mobil' : 'Motor'} • {activeVehicle.plat}
								</small>
							</div>
						</div>
						<Badge variant="outline" class="border-primary/40 bg-primary/10 text-xs font-semibold text-primary">
							Aktif
						</Badge>
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-4 text-center">
						<small class="text-xs text-muted-foreground">Belum ada kendaraan yang didaftarkan.</small>
						<Button href="/profile/vehicles" variant="link" size="sm" class="mt-1 h-auto text-xs text-primary">
							+ Daftarkan Kendaraan
						</Button>
					</div>
				{/if}

				<Button
					href="/profile/vehicles"
					variant="outline"
					size="sm"
					class="mt-3 w-full justify-between text-xs"
				>
					<span>Kelola Semua Kendaraan ({userVehicles.length}/5)</span>
					<ChevronRightIcon class="size-3.5 text-muted-foreground" />
				</Button>
			</Card.Content>
		</Card.Root>

		<!-- Logout Button -->
		<Button
			variant="outline"
			class="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
			onclick={logout}
		>
			<LogOutIcon class="mr-2 size-4" /> Keluar dari Akun
		</Button>
	</div>

	<!-- RIGHT COLUMN: Settings, Security, and Methodology -->
	<div class="flex flex-col gap-5 md:col-span-7">
		<!-- Security & Account Settings -->
		<Card.Root class="border-border/80 shadow-sm">
			<Card.Header class="pb-2">
				<Card.Title class="text-base font-semibold">Keamanan & Kredensial</Card.Title>
				<Card.Description class="text-xs">Pengaturan akses akun dan proteksi sandi</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col divide-y divide-border/60 p-0">
				<Button
					href="/profile/reset-password"
					variant="ghost"
					class="h-auto w-full justify-between rounded-none px-5 py-3.5"
				>
					<div class="flex items-center gap-3">
						<KeyRoundIcon class="size-4 text-muted-foreground" />
						<div class="text-left">
							<b class="block text-sm font-medium text-foreground">Ganti Kata Sandi</b>
							<small class="text-xs text-muted-foreground">Perbarui password melalui verifikasi OTP</small>
						</div>
					</div>
					<ChevronRightIcon class="size-4 text-muted-foreground" />
				</Button>

				<div class="flex items-center justify-between px-5 py-3.5">
					<div class="flex items-center gap-3">
						<LockIcon class="size-4 text-muted-foreground" />
						<div class="text-left">
							<b class="block text-sm font-medium text-foreground">Autentikasi Dua Faktor (2FA)</b>
							<small class="text-xs text-muted-foreground">Proteksi verifikasi OTP Supabase</small>
						</div>
					</div>
					<Badge variant="secondary" class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
						Aktif
					</Badge>
				</div>

				<div class="flex items-center justify-between px-5 py-3.5">
					<div class="flex items-center gap-3">
						<ShieldIcon class="size-4 text-muted-foreground" />
						<div class="text-left">
							<b class="block text-sm font-medium text-foreground">Proteksi Data & Sesi</b>
							<small class="text-xs text-muted-foreground">Enkripsi Row Level Security (RLS) PostgreSQL</small>
						</div>
					</div>
					<Badge variant="outline" class="text-[10px] text-muted-foreground">Tersertifikasi</Badge>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Methodology, Transparency & Help -->
		<Card.Root class="border-border/80 shadow-sm">
			<Card.Header class="pb-2">
				<Card.Title class="text-base font-semibold">Bantuan & Transparansi Data</Card.Title>
				<Card.Description class="text-xs">Informasi metodologi AI, regulasi, dan dukungan pengguna</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col divide-y divide-border/60 p-0">
				<!-- Methodology Button -->
				<button
					type="button"
					onclick={() => (methodologyOpen = true)}
					class="flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-muted/40"
				>
					<div class="flex items-center gap-3">
						<SparklesIcon class="size-4 text-primary" />
						<div>
							<b class="block text-sm font-medium text-foreground">Metodologi & Formula SPP</b>
							<small class="text-xs text-muted-foreground">Transparansi algoritma pembobotan 70/30 & confidence level</small>
						</div>
					</div>
					<Badge variant="secondary" class="text-xs font-semibold text-primary">Lihat Detail</Badge>
				</button>

				<div class="flex items-center justify-between px-5 py-3.5">
					<div class="flex items-center gap-3">
						<CircleHelpIcon class="size-4 text-muted-foreground" />
						<div class="text-left">
							<b class="block text-sm font-medium text-foreground">Panduan Parkir Stasiun</b>
							<small class="text-xs text-muted-foreground">Tips memilih kantong parkir resmi vs swadaya warga</small>
						</div>
					</div>
					<ChevronRightIcon class="size-4 text-muted-foreground" />
				</div>

				<div class="flex items-center justify-between px-5 py-3.5">
					<div class="flex items-center gap-3">
						<FileTextIcon class="size-4 text-muted-foreground" />
						<div class="text-left">
							<b class="block text-sm font-medium text-foreground">Ketentuan Layanan & Sumber Data</b>
							<small class="text-xs text-muted-foreground">Integrasi GEO MAPID Geoserver & OpenStreetMap</small>
						</div>
					</div>
					<ChevronRightIcon class="size-4 text-muted-foreground" />
				</div>
			</Card.Content>
		</Card.Root>

		<!-- System Information Footer Card -->
		<Card.Root class="bg-muted/40 border-dashed border-border text-center">
			<Card.Content class="p-4 text-xs text-muted-foreground leading-relaxed">
				<b class="text-foreground">CrowdPark AI v3.0</b> • Serverless WebGIS Yogyakarta Transit Hub<br />
				Koneksi: Supabase PostgreSQL (PostGIS) • Cloud Region ap-southeast-1<br />
				Model AI: Gemini 1.5 • MAPID Geoserver REST API
			</Card.Content>
		</Card.Root>
	</div>
</main>

<!-- Drawer Ubah Nama Profil -->
<Drawer.Root bind:open={editNameOpen}>
	<Drawer.Content class="mx-auto max-w-md px-4 pb-6">
		<Drawer.Header class="px-0 text-left">
			<Drawer.Title>Ubah Nama Profil</Drawer.Title>
			<Drawer.Description>Nama ini akan muncul di profil dan ulasan parkir yang Anda tulis.</Drawer.Description>
		</Drawer.Header>
		<div class="py-3">
			<label class="text-xs font-medium text-muted-foreground" for="edit-name">Nama Lengkap</label>
			<input
				id="edit-name"
				bind:value={newNameInput}
				placeholder="Ketik nama lengkap Anda"
				class="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
			/>
		</div>
		<Drawer.Footer class="flex-row gap-2 px-0 pt-2">
			<Button variant="outline" class="flex-1" onclick={() => (editNameOpen = false)}>Batal</Button>
			<Button class="flex-1 shadow-brand" disabled={savingName} onclick={handleSaveName}>
				{savingName ? 'Menyimpan...' : 'Simpan Nama'}
			</Button>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>

<!-- Drawer Metodologi & Transparansi AI (FR-12) -->
<Drawer.Root bind:open={methodologyOpen}>
	<Drawer.Content class="mx-auto max-h-[85dvh] max-w-lg overflow-y-auto px-5 pb-8">
		<Drawer.Header class="px-0 text-left">
			<div class="flex items-center gap-2">
				<SparklesIcon class="size-5 text-primary" />
				<Drawer.Title class="text-lg font-bold">Metodologi & Transparansi Teknis</Drawer.Title>
			</div>
			<Drawer.Description>
				Transparansi kalkulasi Skor Prioritas Parkir (SPP) dan validasi data CrowdPark AI.
			</Drawer.Description>
		</Drawer.Header>

		<div class="flex flex-col gap-4 text-xs leading-relaxed text-foreground">
			<!-- Formula SPP -->
			<div class="rounded-xl border border-primary/20 bg-primary/5 p-3.5">
				<b class="block text-sm font-semibold text-primary">Formula Skor Prioritas Parkir (SPP)</b>
				<code class="my-2 block rounded bg-background p-2 font-mono text-xs font-bold text-foreground">
					SPP = 0.70 × Skor_Kapasitas + 0.30 × Skor_Jarak
				</code>
				<p class="text-muted-foreground">
					Bobot 70/30 diterapkan karena ketersediaan slot parkir merupakan kendala mutlak (parkir penuh tidak dapat digunakan), sedangkan jarak adalah faktor kenyamanan sekunder.
				</p>
			</div>

			<!-- Confidence Level -->
			<div>
				<b class="text-sm font-semibold text-foreground">Tingkat Keyakinan (Confidence Level)</b>
				<div class="mt-2 flex flex-col gap-2">
					<div class="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5">
						<span class="font-medium text-emerald-800">🟢 Keyakinan Tinggi</span>
						<span class="text-muted-foreground">≥ 10 observasi historis</span>
					</div>
					<div class="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/50 p-2.5">
						<span class="font-medium text-amber-800">🟡 Keyakinan Sedang</span>
						<span class="text-muted-foreground">3 sampai 9 observasi historis</span>
					</div>
					<div class="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50/50 p-2.5">
						<span class="font-medium text-rose-800">🔴 Data Terbatas</span>
						<span class="text-muted-foreground">&lt; 3 observasi historis</span>
					</div>
				</div>
			</div>

			<!-- Sumber Data & Integrasi -->
			<div>
				<b class="text-sm font-semibold text-foreground">Sumber Data Spasial & Geometri</b>
				<ul class="mt-1 list-disc space-y-1 pl-4 text-muted-foreground">
					<li><b>GEO MAPID Geoserver:</b> Sinkronisasi live batas fisik polygon area parkir Jl. Perwakilan dan bahu jalan Lempuyangan.</li>
					<li><b>Supabase PostGIS:</b> Penyimpanan titik koordinat stasiun, kantong parkir, dan matriks jarak jalan kaki.</li>
					<li><b>OpenStreetMap & OSRM:</b> Penentuan rute pejalan kaki menuju pintu masuk stasiun kereta api.</li>
				</ul>
			</div>

			<!-- Keterbatasan Data -->
			<div class="rounded-xl border border-border bg-muted/30 p-3">
				<b class="text-foreground">Keterbatasan Data Lapangan</b>
				<p class="mt-1 text-muted-foreground">
					Data keterisian dikumpulkan melalui survei berkala jam sibuk commuter (06:00-19:00 WIB). Sistem tidak menampilkan label real-time mutlak melainkan estimasi probabilistik berbasis data historis lapangan.
				</p>
			</div>
		</div>

		<Drawer.Footer class="px-0 pt-4">
			<Button class="w-full" onclick={() => (methodologyOpen = false)}>Tutup</Button>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>

