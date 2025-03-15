<script lang="ts">
	import type { Drawer } from '$lib/zod-schemas.js';
	let { data } = $props();
	const doses = data.doses;
</script>

{#snippet DrawerVis(drawer: Drawer)}
	<div class="flex space-x-2 self-end border p-2">
		{#each doses[drawer]! as dose}
			{@const tubeName = `${dose.drawer}${dose.tubeNumber}`}
			<div
				class="flex h-8 w-8 items-center justify-center rounded-full font-mono
				{dose.coffeeId ? 'bg-error' : 'bg-success'}"
			>
				{#if dose.coffeeId}
					<a href="/doses/{tubeName}">
						{tubeName}
					</a>
				{:else}
					{tubeName}
				{/if}
			</div>
		{/each}
	</div>
{/snippet}

<div class="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-4">
	<h1 class="mb-0 self-center justify-self-center">Current freezer</h1>
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
