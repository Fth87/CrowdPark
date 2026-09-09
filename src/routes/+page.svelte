<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let status = $derived(
		data.supabaseConfigured
			? data.claims
				? 'Supabase aktif dan session terverifikasi.'
				: 'Supabase aktif. Belum ada session login.'
			: 'Supabase belum dikonfigurasi. Salin .env.example menjadi .env lalu isi kredensial project.'
	);
</script>

<svelte:head>
	<title>GIS | SvelteKit + Supabase</title>
	<meta name="description" content="Fondasi aplikasi GIS berbasis SvelteKit dan Supabase." />
</svelte:head>

<main
	class="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-16"
>
	<p class="mb-4 w-fit text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">GIS</p>
	<h1 class="max-w-3xl text-5xl font-semibold leading-none tracking-tight sm:text-7xl">
		Fondasi aplikasi siap dikembangkan.
	</h1>
	<p class="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
		SvelteKit menangani routing dan rendering server. Supabase sudah terhubung melalui client SSR
		berbasis cookie.
	</p>

	<section class="mt-14 border-t border-slate-200 pt-6" aria-labelledby="status-title">
		<div class="flex items-start gap-3">
			<span
				class={`mt-1.5 size-2.5 shrink-0 rounded-full ${data.supabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`}
				aria-hidden="true"
			></span>
			<div>
				<h2 id="status-title" class="text-sm font-semibold text-slate-900">Status konfigurasi</h2>
				<p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{status}</p>
			</div>
		</div>
	</section>
</main>
