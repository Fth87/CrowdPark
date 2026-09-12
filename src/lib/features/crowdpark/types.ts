export type NavItem = 'home' | 'maps' | 'ai' | 'saved' | 'profile';

export type Vehicle = {
	id: string;
	icon: string;
	name: string;
	plate: string;
	type: 'Motorcycle' | 'Car';
	active?: boolean;
};

export type ParkingSpot = {
	id: string;
	name: string;
	address: string;
	lat: number;
	lng: number;
	openSlots: number;
	totalSlots: number;
	rate: string;
	driveMinutes: number;
	distanceKm: number;
	walkMinutes: number;
	rating: number;
	reviews: number;
	confidence: number;
};

export type MapLocation = {
	id?: string;
	lat: number;
	lng: number;
	slots?: number;
	status?: 'open' | 'low' | 'full';
	primary?: boolean;
};
