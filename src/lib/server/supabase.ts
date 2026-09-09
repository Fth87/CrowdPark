import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import type { RequestEvent } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/database.types';

export function createSupabaseServerClient(event: RequestEvent): SupabaseClient<Database> | null {
	const url = env.PUBLIC_SUPABASE_URL;
	const key = env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

	if (!url || !key) return null;

	return createServerClient<Database>(url, key, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet, headers) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});

				if (Object.keys(headers).length > 0) event.setHeaders(headers);
			}
		}
	});
}
