/**
 * api.ts — CrowdPark FE API layer (serverless / Supabase-only)
 *
 * - Auth      : langsung via supabase.auth.*
 * - DB        : langsung via supabase.from('parking_lots_geo').select(...)
 * - ML + AI   : via Supabase Edge Functions
 */

import { createBrowserClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import type { MapLocation, ParkingSpot } from './types';

// ─────────────────────────────────────────────
// Supabase browser client (singleton)
// ─────────────────────────────────────────────
let _supabase: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase() {
	if (!_supabase) {
		const url = env.PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
		const key = env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';
		_supabase = createBrowserClient(url, key);
	}
	return _supabase;
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export const signIn = async (email: string, password: string) => {
	const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
	return { data, error };
};

export const signUp = async (email: string, password: string, name: string) => {
	const { data, error } = await getSupabase().auth.signUp({
		email,
		password,
		options: { data: { full_name: name } }
	});
	return { data, error };
};

export const verifyOtp = async (email: string, token: string) => {
	const { data, error } = await getSupabase().auth.verifyOtp({
		email,
		token,
		type: 'signup'
	});
	return { data, error };
};

export const resendOtp = async (email: string) => {
	const { data, error } = await getSupabase().auth.resend({
		type: 'signup',
		email
	});
	return { data, error };
};

export const signOut = async () => {
	await getSupabase().auth.signOut();
};

export const getSession = async () => {
	const { data } = await getSupabase().auth.getSession();
	return data.session;
};

// ─────────────────────────────────────────────
// PARKING LOTS — query langsung dari Supabase DB
// ─────────────────────────────────────────────

export const fetchParkingLots = async (): Promise<MapLocation[]> => {
	try {
		const { data, error } = await getSupabase()
			.from('parking_lots_geo')
			.select('id, nama, lat, lng, kapasitas_motor, kapasitas_mobil')
			.eq('is_active', true);

		if (error) throw error;

		return (data ?? []).map((lot: any) => ({
			id: lot.id.toString(),
			lat: lot.lat,
			lng: lot.lng,
			slots: lot.kapasitas_motor + lot.kapasitas_mobil,
			status: 'open' as const,
			primary: lot.nama.toLowerCase().includes('lempuyangan')
		}));
	} catch (err) {
		console.error('[fetchParkingLots]', err);
		return [];
	}
};

// ─────────────────────────────────────────────
// PARKING ESTIMATE — via Edge Function
// (needs ML call, so can't run purely in browser)
// ─────────────────────────────────────────────

export const fetchParkingEstimate = async (lotId: number): Promise<ParkingSpot | null> => {
	try {
		const now = new Date();
		const { data, error } = await getSupabase().functions.invoke('parking-estimate', {
			body: {
				lot_id: lotId,
				day: now.getDay() || 7, // 1=Mon … 7=Sun
				hour: now.getHours(),
				vehicle: 'motor'
			}
		});

		if (error) throw error;
		return data?.data ?? null;
	} catch (err) {
		console.error('[fetchParkingEstimate]', err);
		return null;
	}
};

// ─────────────────────────────────────────────
// AI INSIGHT — via Edge Function
// ─────────────────────────────────────────────

export const fetchAiInsight = async (
	_query: string,
	lotIds?: number[]
): Promise<{ narasi: string; lots: any[] } | null> => {
	try {
		// Jika lot_ids tidak diberikan, ambil semua lot aktif dari DB dulu
		let ids = lotIds;
		if (!ids || ids.length === 0) {
			const { data } = await getSupabase()
				.from('parking_lots_geo')
				.select('id')
				.eq('is_active', true)
				.limit(5);
			ids = (data ?? []).map((r: any) => r.id);
		}

		if (!ids || ids.length === 0) return null;

		const now = new Date();
		const { data, error } = await getSupabase().functions.invoke('ai-insight', {
			body: {
				lot_ids: ids,
				day: now.getDay() || 7,
				hour: now.getHours(),
				vehicle: 'motor'
			}
		});

		if (error) throw error;

		return {
			narasi: data?.data?.narasi ?? '',
			lots: data?.data?.lots ?? []
		};
	} catch (err) {
		console.error('[fetchAiInsight]', err);
		return null;
	}
};

// ─────────────────────────────────────────────
// SAVED SPOTS
// ─────────────────────────────────────────────

export const fetchSavedSpots = async (): Promise<ParkingSpot[]> => {
	try {
		const { data, error } = await getSupabase()
			.from('user_saved_spots')
			.select(`
				lot_id,
				parking_lots_geo (
					id, nama, tipe, lat, lng,
					kapasitas_motor, kapasitas_mobil,
					tarif_motor, durasi_detik
				)
			`);

		if (error) throw error;

		return (data ?? []).map((row: any) => {
			const lot = row.parking_lots_geo;
			return {
				id: lot.id.toString(),
				name: lot.nama,
				address: lot.tipe,
				lat: lot.lat,
				lng: lot.lng,
				openSlots: lot.kapasitas_motor,
				totalSlots: lot.kapasitas_motor,
				rate: lot.tarif_motor ? `Rp ${lot.tarif_motor.toLocaleString('id-ID')}` : 'Gratis',
				driveMinutes: 10,
				distanceKm: 8,
				walkMinutes: lot.durasi_detik ? Math.ceil(lot.durasi_detik / 60) : 3,
				rating: 4.5,
				reviews: 0,
				confidence: 75
			};
		});
	} catch (err) {
		console.error('[fetchSavedSpots]', err);
		return [];
	}
};

export const saveSpot = async (lotId: number) => {
	const session = await getSession();
	if (!session) return { error: 'Not authenticated' };
	const { error } = await getSupabase()
		.from('user_saved_spots')
		.upsert({ user_id: session.user.id, lot_id: lotId });
	return { error };
};

export const unsaveSpot = async (lotId: number) => {
	const session = await getSession();
	if (!session) return;
	await getSupabase()
		.from('user_saved_spots')
		.delete()
		.eq('lot_id', lotId);
};

// ─────────────────────────────────────────────
// VEHICLES
// ─────────────────────────────────────────────

export const fetchVehicles = async () => {
	const { data, error } = await getSupabase()
		.from('user_vehicles')
		.select('*')
		.order('created_at');
	return { data: data ?? [], error };
};

export const upsertVehicle = async (vehicle: {
	id?: number;
	nama: string;
	tipe: 'motor' | 'mobil';
	plat: string;
	is_active: boolean;
}) => {
	const session = await getSession();
	if (!session) return { error: 'Not authenticated' };
	const { data, error } = await getSupabase()
		.from('user_vehicles')
		.upsert({ ...vehicle, user_id: session.user.id });
	return { data, error };
};

export const setActiveVehicle = async (vehicleId: number) => {
	const session = await getSession();
	if (!session) return;
	// Deactivate all first
	await getSupabase()
		.from('user_vehicles')
		.update({ is_active: false })
		.eq('user_id', session.user.id);
	// Activate selected
	await getSupabase()
		.from('user_vehicles')
		.update({ is_active: true })
		.eq('id', vehicleId);
};
// ─────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────

export const fetchReviews = async (lotId: number) => {
	try {
		const { data, error } = await getSupabase()
			.from('parking_reviews')
			.select('*')
			.eq('lot_id', lotId)
			.order('created_at', { ascending: false });
		if (error) throw error;
		return data ?? [];
	} catch (err) {
		console.error('[fetchReviews]', err);
		return [];
	}
};

// ─────────────────────────────────────────────
// GEO MAPID LAYER
// ─────────────────────────────────────────────

export interface MapidFeature {
	id: string;
	type: string;
	geometry: {
		type: string;
		coordinates: number[][][];
	};
	properties: {
		id_tool?: string;
		area_meter_square?: string;
		area_hectare?: number;
		[key: string]: any;
	};
	user?: {
		_id: string;
		name: string;
		full_name: string;
	};
}

export interface MapidLayerData {
	layer_id: string;
	layer_name: string;
	fields: Array<{ key: string; name: string; type: string; description: string }>;
	folder_id: string;
	type: string;
	features: MapidFeature[];
}

export const MAPID_CONFIG = {
	apiKey: env.PUBLIC_MAPID_API_KEY || '7ed0f3e340ec44c7b17cc8305b729e37',
	projectId: env.PUBLIC_MAPID_PROJECT_ID || '6a945f3b03ee2f4d1ee63bc4',
	layerIds: [
		'6a998292ed2d202e6a8fd78e', // parkir motor jl.perwakilan
		'6aa6af04753cb27abe0e44b1'  // kantong parkir bahu jalan
	]
};

export const fetchMapidLayer = async (
	layerId: string = MAPID_CONFIG.layerIds[0]
): Promise<MapidLayerData | null> => {
	try {
		const apiKey = MAPID_CONFIG.apiKey;
		const projectId = MAPID_CONFIG.projectId;
		const url = `https://geoserver.mapid.io/layers_new/get_layer?api_key=${apiKey}&layer_id=${layerId}&project_id=${projectId}`;
		const res = await fetch(url);
		if (!res.ok) throw new Error(`HTTP error ${res.status}`);
		const json = await res.json();
		return json as MapidLayerData;
	} catch (err) {
		console.error(`[fetchMapidLayer:${layerId}]`, err);
		return null;
	}
};

export const fetchMapidLayers = async (
	layerIds: string[] = MAPID_CONFIG.layerIds
): Promise<MapidLayerData[]> => {
	try {
		const results = await Promise.all(layerIds.map((id) => fetchMapidLayer(id)));
		return results.filter((item): item is MapidLayerData => item !== null);
	} catch (err) {
		console.error('[fetchMapidLayers]', err);
		return [];
	}
};


