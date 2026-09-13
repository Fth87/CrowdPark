<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import type { Map } from 'leaflet';
	import { cn } from '$lib/utils';
	import { fetchParkingLots, fetchMapidLayer, type MapidLayerData } from '../api';
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
	let mapidLayerData = $state<MapidLayerData | null>(null);

	onMount(() => {
		let active = true;
		let resizeObserver: ResizeObserver | undefined;

		const initMap = async () => {
			if (mode === 'parking') {
				const [spots, layerData] = await Promise.all([
					fetchParkingLots(),
					fetchMapidLayer()
				]);
				dynamicSpots = spots;
				mapidLayerData = layerData;
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

				// Render GEO MAPID polygon layer if available
				if (mode === 'parking' && mapidLayerData && mapidLayerData.features?.length > 0) {
					L.geoJSON(mapidLayerData as any, {
						style: {
							color: '#0284c7',
							weight: 2.5,
							dashArray: '5, 5',
							fillColor: '#38bdf8',
							fillOpacity: 0.35
						},
						onEachFeature: (feature, layer) => {
							const props = feature.properties || {};
							const areaM2 = props.area_meter_square ?? '-';
							const areaHa = props.area_hectare ?? '-';
							const idTool = props.id_tool ?? 'A-1';
							const featureAny = feature as any;
							const userName = featureAny.user?.name || featureAny.user?.full_name || 'janu';

							layer.bindPopup(`
								<div style="font-family: inherit; font-size: 13px; line-height: 1.5; min-width: 190px;">
									<div style="font-weight: 700; color: #0284c7; font-size: 14px; margin-bottom: 3px;">
										🗺️ ${mapidLayerData?.layer_name || 'Area Parkir GEO MAPID'}
									</div>
									<div style="color: #64748b; font-size: 12px; margin-bottom: 6px;">
										Digitasi oleh <b>${userName}</b> (${idTool})
									</div>
									<div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 6px 8px; color: #0369a1; font-size: 12px; margin-bottom: 6px;">
										Luas Area: <b>${areaM2} m²</b> (${areaHa} ha)
									</div>
									<div style="font-size: 11px; color: #94a3b8;">
										Live Sync: GEO MAPID Geoserver API
									</div>
								</div>
							`);
						}
					}).addTo(map);
				}

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
						marker.on('click', () => onselect?.(spot));
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

<div class={cn('relative isolate h-full w-full', className)}>
	<div
		bind:this={container}
		class="h-full w-full bg-muted"
		aria-label={mode === 'parking' ? 'Parking availability map' : 'Current location map'}
	></div>

	{#if mode === 'parking' && mapidLayerData}
		<div
			class="pointer-events-none absolute top-3 right-3 z-[1000] flex items-center gap-1.5 rounded-full border border-sky-200 bg-white/95 px-3 py-1 text-xs font-semibold text-sky-900 shadow-sm backdrop-blur-sm"
		>
			<span class="size-2 animate-pulse rounded-full bg-sky-500"></span>
			<span>GEO MAPID: {mapidLayerData.layer_name}</span>
		</div>
	{/if}
</div>


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
