<script lang="ts">
	import type { Drawer } from '$lib/zod-schemas.js';
	let { data } = $props();
</script>

{#snippet DrawerVis(drawer: Drawer)}
	<div class="flex space-x-2 self-end border p-2">
		{#each data.dosesByDrawer[drawer]! as dose}
			{@const tubeName = `${dose.drawer}${dose.tubeNumber}`}
			<div
				class="flex h-8 w-8 items-center justify-center rounded-full font-mono
				{dose.coffeeId ? 'bg-success text-success-content' : 'bg-neutral text-neutral-content'}"
			>
				{#if dose.coffeeId}
					<a href="/doses/{tubeName}" class="link link-hover">
						{tubeName}
					</a>
				{:else}
					{tubeName}
				{/if}
			</div>
		{/each}
	</div>
{/snippet}

<div class="stats mb-8 shadow">
	<div class="stat place-items-center">
		<div class="stat-title">Total Doses</div>
		<div class="stat-value text-3xl">{data.totalDoses}</div>
	</div>
	<div class="stat place-items-center">
		<div class="stat-title">Total Weight</div>
		<div class="stat-value text-3xl">{data.totalWeight}g</div>
	</div>
	<div class="stat place-items-center">
		<div class="stat-title">Unique Coffees</div>
		<div class="stat-value text-3xl">{data.totalCoffees}</div>
	</div>
</div>

<div class="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-4">
	<div class="hidden lg:block"></div>
	{@render DrawerVis('D')}
	{@render DrawerVis('H')}
	{@render DrawerVis('A')}
	{@render DrawerVis('E')}
	{@render DrawerVis('I')}
	{@render DrawerVis('B')}
	{@render DrawerVis('F')}
	{@render DrawerVis('J')}
	{@render DrawerVis('C')}
	{@render DrawerVis('G')}
	{@render DrawerVis('K')}
</div>
