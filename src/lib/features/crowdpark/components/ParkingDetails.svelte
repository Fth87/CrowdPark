<script lang="ts">
	import BookmarkIcon from '@lucide/svelte/icons/bookmark';
	import NavigationIcon from '@lucide/svelte/icons/navigation';
	import Share2Icon from '@lucide/svelte/icons/share-2';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import * as Alert from '$lib/components/ui/alert';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { facilities, parkingSpot as staticSpot } from '../data';
	import { fetchParkingEstimate, fetchReviews } from '../api';
	import type { ParkingSpot } from '../types';

	let { sheet = false, id = undefined }: { sheet?: boolean; id?: string } = $props();

	let spot = $state<ParkingSpot>(staticSpot);
	let lastUpdated = $state<Date | null>(null);
	let dbReviews = $state<any[]>([]);

	$effect(() => {
		if (id) {
			fetchParkingEstimate(Number(id)).then((data) => {
				if (data) {
					spot = data;
					lastUpdated = new Date();
				}
			});
			fetchReviews(Number(id)).then((data) => {
				dbReviews = data;
			});
		}
	});

	const syncText = $derived(() => {
		if (!lastUpdated) return 'Belum diperbarui';
		const diff = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
		if (diff < 60) return `${diff}d lalu`;
		if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
		return `${Math.floor(diff / 3600)}j lalu`;
	});

	const aiInsightText = $derived(
		spot.openSlots != null
			? `${spot.name} saat ini tersisa ~${spot.openSlots} dari ${spot.totalSlots} slot (${spot.confidence}% confidence). Jarak ke pintu stasiun ${spot.walkMinutes} menit jalan kaki.`
			: 'Data estimasi belum tersedia untuk lokasi ini.'
	);

	let metrics = $derived([
		{
			label: 'P　Free slot',
			value: `~${spot.openSlots} open`,
			detail: `of ${spot.totalSlots} slot`
		},
		{ label: '▣　Rate', value: spot.rate, detail: 'Flat hour' },
		{ label: '♙　Walk', value: `${spot.walkMinutes} mnt`, detail: 'walk to the station' }
	]);
	const avgRating = $derived(
		dbReviews.length > 0
			? (dbReviews.reduce((sum, r) => sum + r.rating, 0) / dbReviews.length).toFixed(1)
			: '0.0'
	);
	
	const formatRelativeTime = (dateStr: string) => {
		const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
		if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
		if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
		return `${Math.floor(diff / 86400)} hari lalu`;
	};
</script>

<Card.Root
	class={sheet
		? 'rounded-none rounded-t-[30px] border-0 shadow-none [--card-spacing:--spacing(4)]'
		: 'rounded-none border-0 shadow-none [--card-spacing:--spacing(4)]'}
>
	{#if sheet}<div class="mx-auto h-1 w-12 rounded-full bg-border"></div>{/if}
	<Card.Header>
		<div class="flex items-start justify-between">
			<div>
				<Card.Title>{spot.name}</Card.Title><Card.Description>{spot.address}</Card.Description>
				<div class="mt-1 flex gap-1">
					<Badge variant="secondary">Motorcycle parking area</Badge><Badge variant="secondary"
						>★ {spot.rating}（{spot.reviews} ulasan）</Badge
					>
				</div>
			</div>
			<Badge variant="secondary" class="h-auto flex-col text-route"
				><b>{spot.driveMinutes} min</b><small>{spot.distanceKm} km</small></Badge
			>
		</div>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<Alert.Root
			><SparklesIcon /><Alert.Title>AI Insight</Alert.Title><Alert.Description
				>{aiInsightText}</Alert.Description
			></Alert.Root
		>
		<div class="grid grid-cols-3 gap-3">
			{#each metrics as metric (metric.label)}<Card.Root size="sm"
					><Card.Header
						><Card.Description>{metric.label}</Card.Description><Card.Title
							>{metric.value}</Card.Title
						></Card.Header
					><Card.Content><small class="text-muted-foreground">{metric.detail}</small></Card.Content
					></Card.Root
				>{/each}
		</div>
		<div class="flex gap-3">
			<Button
				href={`https://www.google.com/maps/dir/?api=1&origin=-7.7869,110.3658&waypoints=${spot.lat},${spot.lng}&destination=Stasiun+Yogyakarta`}
				target="_blank"
				rel="noopener noreferrer"
				class="h-12 flex-1"><NavigationIcon />Go there</Button
			><Button
				variant="secondary"
				size="icon-lg"
				aria-label="Save place"
				class="size-12 rounded-full"><BookmarkIcon /></Button
			><Button
				variant="secondary"
				size="icon-lg"
				aria-label="Share place"
				class="size-12 rounded-full"><Share2Icon /></Button
			>
		</div>
		<div>
			<h2 class="font-semibold">Fitur & Fasilitas</h2>
			<div class="mt-3 flex flex-wrap gap-2">
				{#each facilities as item (item)}<Badge variant="secondary">{item}</Badge>{/each}
			</div>
			<p class="mt-2 text-xs text-muted-foreground">
				<span class="text-success">▣</span> Confidence: {spot.confidence}%　 Sync {syncText()}
			</p>
		</div>
		<Separator />
		<div class="flex items-center justify-between">
			<h2 class="font-semibold">Rating & Ulasan<br />Pengguna</h2>
			<Button variant="outline" class="rounded-full">+ Tulis Ulasan</Button>
		</div>
		<Card.Root size="sm" class="bg-secondary"
			><Card.Header class="flex-row items-center"
				><div class="border-r pr-5 text-center">
					<Card.Title class="text-4xl">{avgRating}</Card.Title>
					<p class="text-rating">{'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}</p>
					<Card.Description>{dbReviews.length} ulasan</Card.Description>
				</div>
				<div class="flex flex-1 flex-col gap-1 text-xs">
					{#each [5, 4, 3, 2, 1] as n}
						{@const count = dbReviews.filter((r) => Math.round(r.rating) === n).length}
						{@const pct = dbReviews.length ? (count / dbReviews.length) * 100 : 0}
						<div class="flex items-center gap-2">
							<span>{n}</span><span class="h-1.5 flex-1 rounded-full bg-border"
								><i class="block h-full rounded-full bg-primary" style:width={`${pct}%`}
								></i></span
							>
						</div>{/each}
				</div></Card.Header
			></Card.Root
		>
		{#each dbReviews as review (review.id)}<Card.Root size="sm" class="bg-secondary"
				><Card.Header class="flex-row justify-between"
					><Card.Title>{review.nama_reviewer}</Card.Title><Card.Description>{formatRelativeTime(review.created_at)}</Card.Description
					></Card.Header
				><Card.Content
					><p class="text-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
					<p class="mt-2 text-muted-foreground">{review.ulasan}</p></Card.Content
				></Card.Root
			>{/each}
	</Card.Content>
</Card.Root>
