import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	if (!locals.supabase) {
		return { supabaseConfigured: false, claims: null };
	}

	const { data, error } = await locals.supabase.auth.getClaims();

	return {
		supabaseConfigured: true,
		claims: error ? null : (data?.claims ?? null)
	};
}) satisfies LayoutServerLoad;
