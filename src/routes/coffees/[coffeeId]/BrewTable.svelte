<script lang="ts">
	import { getBrews } from '#lib/brews.remote.js';
	import { formatDateTime } from '#lib/utils.js';

	interface Props {
		coffeeId: number;
	}
	let { coffeeId }: Props = $props();

	const brews = $derived(await getBrews(coffeeId));
	const totalWeight = $derived(brews.reduce((total, brew) => total + brew.weight, 0));
	const headingId = $props.id();
</script>

<section class="space-y-4" aria-labelledby={headingId}>
	<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
		<h2 id={headingId} class="text-lg font-semibold tracking-tight">Brew history</h2>
		{#if brews.length > 0}
			<p class="text-base-content/60 text-sm tabular-nums">
				{brews.length}
				{brews.length === 1 ? 'brew' : 'brews'} <span class="mx-1" aria-hidden="true">·</span>
				{totalWeight.toLocaleString('en-GB', { maximumFractionDigits: 1 })} g consumed
			</p>
		{/if}
	</div>
	{#if brews.length === 0}
		<div class="border-base-300 rounded-box border border-dashed px-4 py-8 text-center">
			<p class="text-base-content/60 text-sm">No brews recorded yet</p>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="table-sm table">
				<caption class="sr-only">Brew dates and weights for this coffee, newest first</caption>
				<thead>
					<tr>
						<th scope="col" class="text-base-content/60 font-medium">Brewed</th>
						<th scope="col" class="text-base-content/60 text-right font-medium">Weight</th>
					</tr>
				</thead>
				<tbody>
					{#each brews as brew (brew.id)}
						<tr>
							<td class="py-3">{formatDateTime(brew.consumptionDate)}</td>
							<td class="text-right font-medium whitespace-nowrap tabular-nums">{brew.weight} g</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
