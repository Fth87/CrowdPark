<script lang="ts">
	import PlusCircleIcon from '@lucide/svelte/icons/circle-plus';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import * as Card from '$lib/components/ui/card';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import AppChrome from '../components/AppChrome.svelte';
	import MobileHeader from '../components/MobileHeader.svelte';
	import { vehicles } from '../data';
	let active = $state('nmax');
</script>

<svelte:head><title>Manage Vehicle · CrowdPark</title></svelte:head>
<AppChrome active="profile" />
<MobileHeader title="Manage Vehicle" eyebrow="CrowdPark" backHref="/profile" />
<main class="pb-mobile-nav mx-auto max-w-[760px] px-4 pt-6 md:min-h-screen md:pt-28">
	<div
		class="mb-3 flex items-center justify-between px-1 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground"
	>
		<span>Registered Fleet</span><span class="text-primary">2 of 5 Slots</span>
	</div>
	<RadioGroup.Root bind:value={active}>
		{#each vehicles as vehicle (vehicle.id)}
			<label for={vehicle.id}
				><Card.Root size="sm" class="cursor-pointer [--card-spacing:--spacing(4)]"
					><Card.Header class="flex-row items-start"
						><RadioGroup.Item value={vehicle.id} id={vehicle.id} />
						<div class="flex-1">
							<div class="flex items-center justify-between">
								<Card.Title>{vehicle.icon} {vehicle.name}</Card.Title
								>{#if active === vehicle.id}<Badge>✓ Active</Badge>{/if}
							</div>
							<Card.Description class="mt-2"
								><b class="rounded bg-secondary px-3 py-1 tracking-[0.12em]">{vehicle.plate}</b
								>　{vehicle.type}</Card.Description
							>
						</div></Card.Header
					><Separator /><Card.Footer class="justify-between"
						><span class={active === vehicle.id ? 'text-success' : 'text-muted-foreground'}
							>{active === vehicle.id
								? 'Station Gate Ready'
								: 'Click to set as active vehicle'}</span
						><Button variant="secondary" size="sm"><PencilIcon />Edit</Button></Card.Footer
					></Card.Root
				></label
			>
		{/each}
	</RadioGroup.Root>
	<Button class="mt-4 h-12 w-full shadow-brand"><PlusCircleIcon />Add New Vehicle</Button>
</main>
