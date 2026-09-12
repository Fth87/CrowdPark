<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import type { Map } from 'leaflet';
	import { cn } from '$lib/utils';
	import { fetchParkingLots } from '../api';
	import { currentLocation } from '../data';
	import type { MapLocation } from '../types';

	let {
		mode = 'parking',
		interactive = true,
		onselect,
		class: className
	}: {
		mode?: 'parking' | 'location';
		interactive?: boolean;
		onselect?: (spot: MapLocation) => void;
		class?: string;
	} = $props();

	let container: HTMLDivElement;
	let map: Map | undefined;
	let dynamicSpots = $state<MapLocation[]>([]);

	onMount(() => {
		let active = true;
		let resizeObserver: ResizeObserver | undefined;

		const initMap = async () => {
			if (mode === 'parking') {
				dynamicSpots = await fetchParkingLots();
			}

			void import('leaflet').then((L) => {
				if (!active || !container) return;
				const center = mode === 'parking' && dynamicSpots.length > 0 ? dynamicSpots[0] : currentLocation;
				map = L.map(container, {
					zoomControl: interactive,
					dragging: interactive,
					touchZoom: interactive,
					doubleClickZoom: interactive,
					scrollWheelZoom: interactive,
					boxZoom: interactive,
					keyboard: interactive
				}).setView([center.lat, center.lng], mode === 'parking' ? 16 : 15);

				L.tileLayer(env.PUBLIC_OSM_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
					maxZoom: 19,
					attribution:
						'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				}).addTo(map);

				if (mode === 'location') {
					L.marker([currentLocation.lat, currentLocation.lng], {
						icon: L.divIcon({
							className: 'crowdpark-marker-shell',
							html: '<span class="crowdpark-location-marker"></span>',
							iconSize: [28, 28],
							iconAnchor: [14, 14]
						}),
						title: 'Current location',
						alt: 'Current location'
					}).addTo(map);
				} else {
					for (const spot of dynamicSpots) {
						const marker = L.marker([spot.lat, spot.lng], {
							icon: L.divIcon({
								className: 'crowdpark-marker-shell',
								html: spot.primary
									? '<span class="crowdpark-parking-marker">P</span>'
									: `<span class="crowdpark-dot crowdpark-dot--${spot.status}"></span>`,
								iconSize: spot.primary ? [44, 44] : [20, 20],
								iconAnchor: spot.primary ? [22, 22] : [10, 10]
							}),
							title: spot.primary ? 'Parkir Timur Lempuyangan' : `${spot.slots} slots open`,
							alt: spot.primary ? 'Parkir Timur Lempuyangan' : `${spot.slots} slots open`
						}).addTo(map);

						marker.bindTooltip(`~${spot.slots} Slot open`, {
							permanent: true,
							direction: 'top',
							offset: [0, spot.primary ? -18 : -8],
							className: 'crowdpark-map-tooltip'
						});
						if (spot.primary) marker.on('click', () => onselect?.(spot));
					}
				}

				resizeObserver = new ResizeObserver(() => map?.invalidateSize({ pan: false }));
				resizeObserver.observe(container);
			});
		};

		initMap();

		return () => {
			active = false;
			resizeObserver?.disconnect();
			map?.remove();
			map = undefined;
		};
	});
</script>

<div
	bind:this={container}
	class={cn('isolate h-full w-full bg-muted', className)}
	aria-label={mode === 'parking' ? 'Parking availability map' : 'Current location map'}
></div>

<style>
	:global(.crowdpark-marker-shell) {
		border: 0;
		background: transparent;
	}
	:global(.crowdpark-parking-marker),
	:global(.crowdpark-location-marker),
	:global(.crowdpark-dot) {
		display: grid;
		width: 100%;
		height: 100%;
		place-items: center;
		border-radius: 999px;
		box-shadow: 0 4px 14px rgb(0 0 0 / 0.22);
	}
	:global(.crowdpark-parking-marker) {
		background: var(--color-success);
		color: white;
		font-size: 20px;
		font-weight: 700;
	}
	:global(.crowdpark-location-marker) {
		border: 7px solid rgb(255 172 71 / 0.28);
		background: var(--color-brand);
	}
	:global(.crowdpark-dot--open) {
		background: var(--color-availability-open);
	}
	:global(.crowdpark-dot--low) {
		background: var(--color-availability-low);
	}
	:global(.crowdpark-dot--full) {
		background: var(--color-availability-full);
	}
	:global(.crowdpark-map-tooltip) {
		border: 0;
		border-radius: 999px;
		box-shadow: var(--shadow-card);
		font-family: var(--font-sans);
		font-size: 14px;
		padding: 7px 14px;
	}
</style>
