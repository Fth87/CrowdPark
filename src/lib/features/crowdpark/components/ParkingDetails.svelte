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
	import { facilities, parkingSpot as spot } from '../data';
	let { sheet = false }: { sheet?: boolean } = $props();
	const metrics = [
		{
			label: 'P　Free slot',
			value: `~${spot.openSlots} open`,
			detail: `of ${spot.totalSlots} slot`
		},
		{ label: '▣　Rate', value: spot.rate, detail: 'Flat hour' },
		{ label: '♙　Walk', value: `${spot.walkMinutes} mnt`, detail: 'walk to the station' }
	];
	const reviews = [
		{
			name: 'Budi S.',
			when: '2 jam lalu',
			text: 'Jukirnya solutif, motor ditaruh rapi. Jalan ke pintu stasiun cuma 3 menit beneran.'
		},
		{
			name: 'Rian Pratama',
			when: 'Kemarin',
			text: 'Tempat teduh beratap aman dari hujan, bayar pakai QRIS lancar.'
		}
	];
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
				>The most convenient walking access from the Malioboro direction when the Main Parking lot
				at Tugu Station is full.</Alert.Description
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
				href="https://www.google.com/maps/dir/?api=1&destination=Stasiun+Lempuyangan"
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
				<span class="text-success">▣</span> Confidence: {spot.confidence}%　 Sync 2m ago
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
					<Card.Title class="text-4xl">4.5</Card.Title>
					<p class="text-rating">★★★★★</p>
					<Card.Description>42 ulasan</Card.Description>
				</div>
				<div class="flex flex-1 flex-col gap-1 text-xs">
					{#each [5, 4, 3, 2] as n}<div class="flex items-center gap-2">
							<span>{n}</span><span class="h-1.5 flex-1 rounded-full bg-border"
								><i class="block h-full rounded-full bg-primary" style:width={`${(n - 1) * 22}%`}
								></i></span
							>
						</div>{/each}
				</div></Card.Header
			></Card.Root
		>
		{#each reviews as review (review.name)}<Card.Root size="sm" class="bg-secondary"
				><Card.Header class="flex-row justify-between"
					><Card.Title>{review.name}</Card.Title><Card.Description>{review.when}</Card.Description
					></Card.Header
				><Card.Content
					><p class="text-rating">★★★★★</p>
					<p class="mt-2 text-muted-foreground">{review.text}</p></Card.Content
				></Card.Root
			>{/each}
	</Card.Content>
</Card.Root>
