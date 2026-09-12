<script lang="ts">
	import BikeIcon from '@lucide/svelte/icons/bike';
	import CarFrontIcon from '@lucide/svelte/icons/car-front';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import CircleHelpIcon from '@lucide/svelte/icons/circle-help';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import InfoIcon from '@lucide/svelte/icons/info';
	import KeyRoundIcon from '@lucide/svelte/icons/key-round';
	import LockIcon from '@lucide/svelte/icons/lock';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import AppChrome from '../components/AppChrome.svelte';
	import MobileHeader from '../components/MobileHeader.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { signOut } from '$lib/features/crowdpark/api';

	// Read real user from Supabase session if available, otherwise fall back to placeholder
	const claims = $derived((page.data as any)?.claims);
	const userEmail = $derived(claims?.email ?? 'bebek@example.com');
	const userName = $derived(claims?.user_metadata?.full_name ?? userEmail.split('@')[0]);
	const userAvatar = $derived(claims?.user_metadata?.avatar_url ?? null);

	const logout = async () => {
		await signOut();
		goto('/login');
	};

	const settings = [
		{
			icon: KeyRoundIcon,
			title: 'Forgot / Change Password',
			text: 'Last changed 3 months ago',
			href: '/profile/reset-password'
		},
		{
			icon: LockIcon,
			title: 'Two-Factor Authentication',
			text: 'SMS & Authenticator App',
			badge: 'Active'
		},
		{ icon: ShieldIcon, title: 'Account Security', text: 'Access credentials & data protection' }
	];
	const help = [
		{ icon: InfoIcon, title: 'Help & Transparency', text: 'AI guidelines & regulations' },
		{ icon: CircleHelpIcon, title: 'Help Center', text: 'FAQ & 24/7 Customer Support' },
		{ icon: FileTextIcon, title: 'Terms of Service', text: 'Privacy Policy & Commuter Data' }
	];
</script>

<svelte:head><title>Profile · CrowdPark</title></svelte:head>
<AppChrome active="profile" />
<MobileHeader />
<main
	class="pb-mobile-nav mx-auto flex max-w-[1040px] flex-col gap-4 px-3 pt-1 md:grid md:min-h-screen md:grid-cols-2 md:items-start md:gap-6 md:px-10 md:pt-24"
>
	<Card.Root class="col-span-2 items-center [--card-spacing:--spacing(5)]"
		><Card.Header class="items-center"
			><Avatar.Root class="size-20 border-4 border-primary shadow-md"
				><Avatar.Image src={userAvatar ?? '/images/crowdpark/profile.png'} alt="Profile photo" /><Avatar.Fallback
					>{userName.slice(0, 2).toUpperCase()}</Avatar.Fallback
				><Avatar.Badge class="bg-primary"><PencilIcon /></Avatar.Badge></Avatar.Root
			><Card.Title class="mt-3 text-xl">{userName}</Card.Title><Card.Description
				class="flex max-w-full flex-wrap items-center justify-center gap-2"
				><span class="whitespace-nowrap">{userEmail}</span><Badge variant="secondary"
					>Verified</Badge
				></Card.Description
			></Card.Header
		></Card.Root
	>
	<Card.Root
		><Card.Header
			><Card.Title>Primary Vehicle</Card.Title><Card.Description
				>Select default vehicle for tariff & slot recommendations</Card.Description
			><Card.Action
				><Button
					href="/profile/vehicles"
					variant="ghost"
					size="icon-sm"
					aria-label="Manage vehicles"><ChevronRightIcon /></Button
				></Card.Action
			></Card.Header
		><Card.Content class="flex flex-col gap-2"
			><div class="rounded-2xl bg-primary p-3">
				<b class="flex items-center gap-2"><BikeIcon />Yamaha NMAX</b><small
					>Motorcycle · AB 4819 XS</small
				>
			</div>
			<div class="rounded-2xl bg-muted p-3">
				<b class="flex items-center gap-2"><CarFrontIcon />Honda Jazz RS</b><small
					class="text-muted-foreground">Car · AB 1022 QZ</small
				>
			</div></Card.Content
		></Card.Root
	>
	<div class="flex flex-col gap-4">
		<Card.Root size="sm"
			><Card.Header class="sr-only"><Card.Title>Account settings</Card.Title></Card.Header
			><Card.Content
				>{#each settings as item, index (item.title)}<Button
						href={item.href ?? '/profile'}
						variant="ghost"
						class="h-auto w-full justify-start py-3"
						><item.icon /><span class="flex-1 text-left"
							><b class="block">{item.title}</b><small class="text-muted-foreground"
								>{item.text}</small
							></span
						>{#if item.badge}<Badge variant="secondary">{item.badge}</Badge>{:else}<ChevronRightIcon
							/>{/if}</Button
					>{#if index < settings.length - 1}<Separator />{/if}{/each}</Card.Content
			></Card.Root
		>
		<Card.Root size="sm"
			><Card.Header class="sr-only"><Card.Title>Help</Card.Title></Card.Header><Card.Content
				>{#each help as item, index (item.title)}<Button
						variant="ghost"
						class="h-auto w-full justify-start py-3"
						><item.icon /><span class="text-left"
							><b class="block">{item.title}</b><small class="text-muted-foreground"
								>{item.text}</small
							></span
						></Button
					>{#if index < help.length - 1}<Separator />{/if}{/each}</Card.Content
			></Card.Root
		>
	</div>
	<Button variant="destructive" class="col-span-2 w-full" onclick={logout}><LogOutIcon />Log Out</Button>
	<p class="col-span-2 text-center text-[10px] text-muted-foreground">
		CrowdPark AI v2.4 · Yogyakarta Transit Hub<br />Real-time Smart Commuter Assistance
	</p>
</main>
