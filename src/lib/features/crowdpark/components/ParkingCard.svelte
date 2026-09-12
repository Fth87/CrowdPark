<script lang="ts">
	import BookmarkIcon from '@lucide/svelte/icons/bookmark';
	import CircleParkingIcon from '@lucide/svelte/icons/circle-parking';
	import InfoIcon from '@lucide/svelte/icons/info';
	import NavigationIcon from '@lucide/svelte/icons/navigation';
	import StarIcon from '@lucide/svelte/icons/star';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { facilities, parkingSpot as staticSpot } from '../data';
	import type { ParkingSpot } from '../types';
	let {
		rank,
		saved = false,
		detailed = false,
		spot = staticSpot
	}: { rank?: number; saved?: boolean; detailed?: boolean; spot?: ParkingSpot } = $props();
</script>

<Card.Root size="sm" class="tracking-[-0.04em] [--card-spacing:--spacing(4)]">
	<Card.Header>
		<div class="flex items-center justify-between">
			<Badge variant="outline"
				><span class="size-4 rounded-full bg-availability-open"></span>~{spot.openSlots} Slot open</Badge
			>
			{#if rank}<Badge variant="secondary">#{rank} Top AI Pick</Badge>{/if}
			{#if saved}<BookmarkIcon class="text-primary" />{/if}
		</div>
		<div class="mt-3 flex justify-between">
			<div>
				<Card.Title>{spot.name}</Card.Title><Card.Description class="flex items-center gap-1"
					><CircleParkingIcon />Motorcycle parking area</Card.Description
				>
			</div>
			<Badge variant="secondary" class="h-auto flex-col text-route"
				><b>{spot.driveMinutes} min</b><small>{spot.distanceKm} km</small></Badge
			>
		</div>
	</Card.Header>
	<Card.Content>
		<p class="flex flex-wrap items-center gap-1 text-xs">
			<StarIcon class="text-primary" />{spot.rating}（{spot.reviews} ulasan） • <b>{spot.rate}</b>
			Flat • <span class="text-success">{spot.walkMinutes} min walk to station</span>
		</p>
		<div class="mt-3 flex flex-wrap gap-2">
			{#each facilities as item (item)}<Badge variant="secondary">{item}</Badge>{/each}
		</div>
		{#if detailed}<p class="mt-3 text-xs text-muted-foreground">
				Confidence: {spot.confidence}%　 Sync 2m ago
			</p>{/if}
	</Card.Content>
	<Card.Footer class="grid grid-cols-2 gap-3">
		<Button
			href={`https://www.google.com/maps/dir/?api=1&origin=-7.7869,110.3658&waypoints=${spot.lat},${spot.lng}&destination=Stasiun+Yogyakarta`}
			target="_blank"
			rel="noopener noreferrer"
		><NavigationIcon />Navigate Here</Button>
		<Button href="/parking/{spot.id}" variant="secondary"><InfoIcon />View Details</Button>
	</Card.Footer>
</Card.Root>
