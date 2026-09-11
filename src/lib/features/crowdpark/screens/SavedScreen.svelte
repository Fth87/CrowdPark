<script lang="ts">
	import AppChrome from '../components/AppChrome.svelte';
	import MobileHeader from '../components/MobileHeader.svelte';
	import ParkingCard from '../components/ParkingCard.svelte';
</script>

<svelte:head><title>Saved Spots · CrowdPark</title></svelte:head>
<AppChrome active="saved" />
<MobileHeader />
<main
	class="pb-mobile-nav mx-auto max-w-[1000px] px-4 pt-2 md:grid md:min-h-screen md:grid-cols-2 md:gap-6 md:px-10 md:pt-28"
>
	<h1 class="sr-only">Saved parking spots</h1>
	<ParkingCard saved />
	<div class="mt-4 md:mt-0"><ParkingCard saved /></div>
</main>
