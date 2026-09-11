import type { MapLocation, ParkingSpot, Vehicle } from './types';

export const station = {
	name: 'Stasiun Yogyakarta',
	address: 'Jalan Margo Utomo 1 (pintu timur) atau, Jl. Ps. Kembang'
};

export const currentLocation: MapLocation = { lat: -7.7869, lng: 110.3658 };

export const parkingSpots: MapLocation[] = [
	{ lat: -7.7908, lng: 110.3667, slots: 164, status: 'open', primary: true },
	{ lat: -7.7884, lng: 110.3627, slots: 6, status: 'low', primary: false },
	{ lat: -7.7943, lng: 110.3702, slots: 1, status: 'full', primary: false }
];

export const parkingSpot: ParkingSpot = {
	id: 'parkir-timur-lempuyangan',
	name: 'Parkir Timur Lempuyangan',
	address: 'Jl. Perwakilan, Yogyakarta',
	openSlots: 164,
	totalSlots: 250,
	rate: 'Rp 3.000',
	driveMinutes: 10,
	distanceKm: 8,
	walkMinutes: 3,
	rating: 4.5,
	reviews: 142,
	confidence: 92
};

export const vehicles: Vehicle[] = [
	{
		id: 'nmax',
		icon: '🛵',
		name: 'Yamaha NMAX 155',
		plate: 'AB 1234 XX',
		type: 'Motorcycle',
		active: true
	},
	{ id: 'jazz', icon: '🚗', name: 'Honda Jazz RS', plate: 'AB 5678 YY', type: 'Car' },
	{ id: 'ferrari', icon: '🚗', name: 'Ferrari 812 Competizione', plate: 'B 1 ANJ', type: 'Car' }
];

export const facilities = [
	'24-Hour Operations',
	'Parking attendant',
	'Near the station',
	'124 x 4 m'
];
