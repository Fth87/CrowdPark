<script lang="ts">
	let { compact = false }: { compact?: boolean } = $props();
</script>

<div class="flex items-start gap-3">
	<div class="size-9 shrink-0 rounded-lg bg-brand md:size-[41px]"></div>
	<div class={compact ? 'hidden sm:block' : ''}>
		<p class="text-xl leading-5 font-medium tracking-[-0.04em]">CrowdPark</p>
		<p class="mt-1 text-sm leading-4 tracking-[-0.04em] text-muted">
			Let’s find your best parking spot.
		</p>
	</div>
</div>
