<script lang="ts">
	import BookmarkIcon from '@lucide/svelte/icons/bookmark';
	import HouseIcon from '@lucide/svelte/icons/house';
	import MapIcon from '@lucide/svelte/icons/map';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import UserIcon from '@lucide/svelte/icons/user';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import Brand from './Brand.svelte';
	import type { NavItem } from '../types';

	let { active }: { active: NavItem } = $props();
	const nav = [
		{ id: 'home', label: 'Home', href: '/', icon: HouseIcon },
		{ id: 'maps', label: 'Maps', href: '/maps', icon: MapIcon },
		{ id: 'ai', label: 'AI', href: '/ai', icon: SparklesIcon },
		{ id: 'saved', label: 'Saved', href: '/saved', icon: BookmarkIcon },
		{ id: 'profile', label: 'Profile', href: '/profile', icon: UserIcon }
	] satisfies { id: NavItem; label: string; href: string; icon: typeof HouseIcon }[];
</script>

<header
	class="fixed inset-x-0 top-0 z-50 hidden h-16 items-center justify-between bg-background px-10 shadow-[0_4px_2px_rgb(0_0_0/0.03)] md:flex"
>
	<Brand />
	<nav aria-label="Primary navigation" class="flex h-full items-center gap-2">
		{#each nav as item (item.id)}
			<Button
				href={item.href}
				variant={active === item.id ? 'link' : 'ghost'}
				class="h-full rounded-none px-3"
			>
				{#if item.id === 'ai'}<item.icon />{:else}{item.label}{/if}
			</Button>
		{/each}
	</nav>
	<Button
		href="/profile"
		variant="outline"
		class="h-auto min-w-44 justify-start rounded-full px-3 py-1"
	>
		<Avatar.Root class="size-7"
			><Avatar.Image src="/images/crowdpark/profile.png" alt="bebek" /><Avatar.Fallback
				>BK</Avatar.Fallback
			></Avatar.Root
		>
		<span
			><b class="block text-sm">bebek</b><small class="block text-[10px] text-muted-foreground"
				>bebek@example.com</small
			></span
		>
	</Button>
</header>

<nav
	aria-label="Mobile navigation"
	class="fixed right-4 bottom-7 left-4 z-50 flex h-[77px] items-center justify-around rounded-[22px] bg-ink px-4 md:hidden"
>
	{#each nav as item (item.id)}
		<Button
			href={item.href}
			variant={item.id === 'ai' ? 'default' : active === item.id ? 'link' : 'ghost'}
			size="icon-lg"
			aria-label={item.label}
			aria-current={active === item.id ? 'page' : undefined}
			class="size-[63px] rounded-full text-white"
		>
			<item.icon />
		</Button>
	{/each}
</nav>

<footer
	class="fixed inset-x-0 bottom-0 z-40 hidden h-8 items-center justify-between bg-background px-10 text-[10px] md:flex"
>
	<Separator class="absolute inset-x-0 top-0" />
	<span>CrowdPark AI v2.4 • Yogyakarta Transit Hub</span>
	<span
		><b class="text-success">ϟ</b> Predictive ML Engine Online　　© 2025 CrowdPark AI. All rights reserved.</span
	>
</footer>
