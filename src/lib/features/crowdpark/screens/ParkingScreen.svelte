<script lang="ts">
	import AppChrome from '../components/AppChrome.svelte';
	import MapCanvas from '../components/MapCanvas.svelte';
	import ParkingDetails from '../components/ParkingDetails.svelte';
</script>

<svelte:head><title>Parkir Timur Lempuyangan · CrowdPark</title></svelte:head>
<AppChrome active="maps" />
<main
	class="min-h-screen bg-white md:grid md:h-screen md:grid-cols-[438px_1fr] md:overflow-hidden md:pt-16"
>
	<div class="pb-8 md:overflow-y-auto"><ParkingDetails sheet /></div>
	<div class="hidden md:block"><MapCanvas /></div>
</main>
