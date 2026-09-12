<script lang="ts">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/state';

	let { title, eyebrow, backHref }: { title?: string; eyebrow?: string; backHref?: string } =
		$props();

	const claims = $derived((page.data as any)?.claims);
	const avatarUrl = $derived(claims?.user_metadata?.avatar_url ?? null);
	const fullName = $derived(claims?.user_metadata?.full_name ?? claims?.email ?? '');
	const initials = $derived(
		fullName
			.split(' ')
			.slice(0, 2)
			.map((w: string) => w[0]?.toUpperCase() ?? '')
			.join('')
	);
</script>

<header class="flex h-[78px] items-start justify-between px-4 pt-[22px] md:hidden">
	{#if title}
		<div class="flex items-center gap-1">
			{#if backHref}<Button href={backHref} variant="ghost" size="icon-sm" aria-label="Back"
					><ChevronLeftIcon /></Button
				>{/if}
			<div class="tracking-[-0.04em]">
				{#if eyebrow}<p class="text-sm leading-4 text-brand-strong">{eyebrow}</p>{/if}
				<h1 class="text-xl leading-5 font-medium">{title}</h1>
			</div>
		</div>
	{:else}
		<div class="tracking-[-0.04em]">
			<p class="text-xl leading-5 font-medium">CrowdPark</p>
			<p class="mt-1 text-sm leading-4 text-muted-foreground">Let's find your best parking spot.</p>
		</div>
	{/if}
	<a href="/profile" aria-label="Go to profile" class="block size-9 overflow-hidden rounded-lg">
		{#if avatarUrl}
			<img src={avatarUrl} alt={fullName} class="size-full object-cover" />
		{:else}
			<div
				class="size-full bg-primary flex items-center justify-center text-sm font-semibold text-primary-foreground"
			>
				{initials || '👤'}
			</div>
		{/if}
	</a>
</header>
