<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import type { Map } from 'leaflet';
	import { cn } from '$lib/utils';
	import { fetchParkingLots, fetchMapidLayers, type MapidLayerData } from '../api';
	import { currentLocation } from '../data';
	import type { MapLocation } from '../types';

	let {
		mode = 'parking',
		interactive = true,
		vehicle = 'motorcycle',
		searchQuery = '',
		onselect,
		class: className
	}: {
		mode?: 'parking' | 'location';
		interactive?: boolean;
		vehicle?: string;
		searchQuery?: string;
		onselect?: (spot: MapLocation) => void;
		class?: string;
	} = $props();

	let container: HTMLDivElement;
	let map: Map | undefined;
	let dynamicSpots = $state<MapLocation[]>([]);
	let mapidLayersData = $state<MapidLayerData[]>([]);
	let markersGroup: any;
	let LInstance: any;

	const LAYER_STYLES = [
		{ color: '#0284c7', fillColor: '#38bdf8' }, // sky blue (Jl. Perwakilan)
		{ color: '#d97706', fillColor: '#fbbf24' }, // amber / orange (Bahu Jalan Lempuyangan)
		{ color: '#059669', fillColor: '#34d399' }, // emerald
		{ color: '#7c3aed', fillColor: '#a78bfa' }  // violet
	];

	function renderMarkers() {
		if (!LInstance || !markersGroup) return;
		markersGroup.clearLayers();

		for (const spot of dynamicSpots) {
			const marker = LInstance.marker([spot.lat, spot.lng], {
				icon: LInstance.divIcon({
					className: 'crowdpark-marker-shell',
					html: spot.primary
						? '<span class="crowdpark-parking-marker">P</span>'
						: `<span class="crowdpark-dot crowdpark-dot--${spot.status}"></span>`,
					iconSize: spot.primary ? [44, 44] : [20, 20],
					iconAnchor: spot.primary ? [22, 22] : [10, 10]
				}),
				title: spot.name || (spot.primary ? 'Parkir Timur Lempuyangan' : `${spot.slots} slots open`),
				alt: spot.name || (spot.primary ? 'Parkir Timur Lempuyangan' : `${spot.slots} slots open`)
			});

			const walkText = spot.walkDistanceMeters
				? `${spot.walkDistanceMeters}m (${Math.ceil((spot.walkDurationSeconds || 60) / 60)} mnt)`
				: '-';
			const motorRateText =
				spot.motorRate != null ? `Rp ${spot.motorRate.toLocaleString('id-ID')}` : 'Gratis / -';
			const carRateText =
				spot.carRate != null ? `Rp ${spot.carRate.toLocaleString('id-ID')}` : null;

			const hoverCard = `
				<div class="crowdpark-hover-card">
					<div class="header">
						<div class="title">${spot.name || 'Kantong Parkir'}</div>
						<div class="type-pill">${spot.type || 'Parkir Publik'}</div>
					</div>
					<div class="divider"></div>
					<div class="grid">
						<div class="item">
							<span class="lbl">🏍️ Kapasitas Motor</span>
							<span class="val">${spot.motorSlots || 0} slot</span>
						</div>
						${spot.carSlots ? `
						<div class="item">
							<span class="lbl">🚗 Kapasitas Mobil</span>
							<span class="val">${spot.carSlots} slot</span>
						</div>` : ''}
						<div class="item">
							<span class="lbl">🚶 Ke Stasiun</span>
							<span class="val">${walkText}</span>
						</div>
						<div class="item">
							<span class="lbl">💰 Tarif Motor</span>
							<span class="val">${motorRateText}</span>
						</div>
						${carRateText ? `
						<div class="item">
							<span class="lbl">💰 Tarif Mobil</span>
							<span class="val">${carRateText}</span>
						</div>` : ''}
						<div class="item">
							<span class="lbl">🕒 Operasional</span>
							<span class="val">${spot.operatingHours || '24 jam'}</span>
						</div>
					</div>
					<div class="footer-hint">
						<span>👆 Klik marker untuk navigasi & ulasan</span>
					</div>
				</div>
			`;

			marker.bindTooltip(hoverCard, {
				direction: 'top',
				offset: [0, spot.primary ? -20 : -10],
				className: 'crowdpark-rich-tooltip',
				opacity: 1
			});

			marker.on('click', () => onselect?.(spot));
			markersGroup.addLayer(marker);
		}
	}

	// Update markers when vehicle changes
	$effect(() => {
		if (mode === 'parking' && vehicle) {
			fetchParkingLots(vehicle).then((spots) => {
				dynamicSpots = spots;
				renderMarkers();
			});
		}
	});

	// Fly to station when searchQuery changes
	$effect(() => {
		if (!map || mode !== 'parking') return;
		const q = searchQuery.toLowerCase().trim();
		if (!q) return;
		if (q.includes('lempuyangan')) {
			map.flyTo([-7.7904, 110.3756], 16, { duration: 1.2 });
		} else if (
			q.includes('tugu') ||
			q.includes('yogyakarta') ||
			q.includes('malioboro') ||
			q.includes('perwakilan')
		) {
			map.flyTo([-7.7892, 110.3632], 16, { duration: 1.2 });
		}
	});

	onMount(() => {
		let active = true;
		let resizeObserver: ResizeObserver | undefined;

		const initMap = async () => {
			if (mode === 'parking') {
				const [spots, layers] = await Promise.all([
					fetchParkingLots(vehicle),
					fetchMapidLayers()
				]);
				dynamicSpots = spots;
				mapidLayersData = layers;
			}

			void import('leaflet').then((L) => {
				if (!active || !container) return;
				LInstance = L;

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

				// Render GEO MAPID polygon layers if available
				if (mode === 'parking' && map && mapidLayersData.length > 0) {
					const targetMap = map;
					mapidLayersData.forEach((layerData, idx) => {
						if (!layerData.features || layerData.features.length === 0) return;
						const styleConfig = LAYER_STYLES[idx % LAYER_STYLES.length];

						L.geoJSON(layerData as any, {
							style: {
								color: styleConfig.color,
								weight: 2.5,
								dashArray: '5, 5',
								fillColor: styleConfig.fillColor,
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
									<div style="font-family: inherit; font-size: 13px; line-height: 1.5; min-width: 200px;">
										<div style="font-weight: 700; color: ${styleConfig.color}; font-size: 14px; margin-bottom: 3px;">
											🗺️ ${layerData.layer_name || 'Area Parkir GEO MAPID'}
										</div>
										<div style="color: #64748b; font-size: 12px; margin-bottom: 6px;">
											Digitasi oleh <b>${userName}</b> (${idTool})
										</div>
										<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; color: #0f172a; font-size: 12px; margin-bottom: 6px;">
											Luas Area: <b>${areaM2} m²</b> (${areaHa} ha)
										</div>
										<div style="font-size: 11px; color: #94a3b8;">
											Live Sync: GEO MAPID Geoserver API
										</div>
									</div>
								`);

								// Sticky hover tooltip on polygon
								layer.bindTooltip(`
									<div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 2px 4px;">
										<div style="font-weight: 700; color: ${styleConfig.color};">🗺️ ${layerData.layer_name}</div>
										<div style="color: #64748b; font-size: 11px;">Luas: <b>${areaM2} m²</b> • Klik untuk info</div>
									</div>
								`, {
									sticky: true,
									direction: 'top',
									className: 'crowdpark-polygon-hover-tooltip'
								});
							}
						}).addTo(targetMap);
					});
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
					markersGroup = L.layerGroup().addTo(map);
					renderMarkers();
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

	{#if mode === 'parking' && mapidLayersData.length > 0}
		<div
			class="pointer-events-none absolute top-3 right-3 z-[1000] flex max-w-[280px] flex-col items-end gap-1.5"
		>
			{#each mapidLayersData as layer, idx}
				{@const styleConfig = LAYER_STYLES[idx % LAYER_STYLES.length]}
				<div
					class="flex items-center gap-1.5 rounded-full border border-border/80 bg-white/95 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-sm"
				>
					<span class="size-2 animate-pulse rounded-full" style:background={styleConfig.color}></span>
					<span class="truncate">GEO MAPID: {layer.layer_name}</span>
				</div>
			{/each}
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
	:global(.crowdpark-rich-tooltip) {
		background: #ffffff !important;
		border: 1px solid rgba(0, 0, 0, 0.08) !important;
		border-radius: 14px !important;
		box-shadow: 0 12px 28px -4px rgba(0, 0, 0, 0.18), 0 8px 10px -6px rgba(0, 0, 0, 0.08) !important;
		padding: 12px 14px !important;
		min-width: 230px !important;
		max-width: 290px !important;
		pointer-events: none;
	}
	:global(.crowdpark-rich-tooltip.leaflet-tooltip-top:before) {
		border-top-color: #ffffff !important;
	}
	:global(.crowdpark-hover-card .header) {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	:global(.crowdpark-hover-card .title) {
		font-weight: 700;
		font-size: 13.5px;
		color: #0f172a;
		line-height: 1.3;
	}
	:global(.crowdpark-hover-card .type-pill) {
		display: inline-block;
		font-size: 11px;
		color: #64748b;
		margin-top: 1px;
	}
	:global(.crowdpark-hover-card .divider) {
		height: 1px;
		background: #f1f5f9;
		margin: 7px 0;
	}
	:global(.crowdpark-hover-card .grid) {
		display: grid;
		grid-template-columns: 1fr;
		gap: 4.5px;
		font-size: 11.5px;
	}
	:global(.crowdpark-hover-card .item) {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
	}
	:global(.crowdpark-hover-card .lbl) {
		color: #64748b;
		white-space: nowrap;
	}
	:global(.crowdpark-hover-card .val) {
		font-weight: 600;
		color: #0f172a;
		text-align: right;
	}
	:global(.crowdpark-hover-card .footer-hint) {
		margin-top: 8px;
		padding-top: 6px;
		border-top: 1px dashed #e2e8f0;
		font-size: 10.5px;
		color: #0284c7;
		font-weight: 600;
		text-align: center;
	}
	:global(.crowdpark-polygon-hover-tooltip) {
		background: #ffffff !important;
		border: 1px solid #bae6fd !important;
		border-radius: 8px !important;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
		padding: 6px 10px !important;
		pointer-events: none;
	}
</style>
