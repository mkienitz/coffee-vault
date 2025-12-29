<script lang="ts">
	import { getCoffeeFlag, formatDateTime } from '$lib/utils';
	import { getBrewPageData } from './data.remote';
	const { totalBrews, totalCoffees, totalWeight, brews } = await getBrewPageData();
</script>

<div class="flex flex-col items-center">
	{#if totalBrews === 0}
		<span class="self-center">There are no recoded brews</span>
	{:else}
		<div class="stats mb-8 shadow">
			<div class="stat place-items-center">
				<div class="stat-title">Total Brews</div>
				<div class="stat-value text-3xl">{totalBrews}</div>
			</div>
			<div class="stat place-items-center">
				<div class="stat-title">Coffees Brewed</div>
				<div class="stat-value text-3xl">{totalCoffees}</div>
			</div>
			<div class="stat place-items-center">
				<div class="stat-title">Grams Brewed</div>
				<div class="stat-value text-3xl">{totalWeight}g</div>
			</div>
		</div>
		<table class="table max-w-fit">
			<thead>
				<tr>
					<th scope="col">Coffee</th>
					<th scope="col">Weight</th>
					<th scope="col">Brewed on</th>
				</tr>
			</thead>
			<tbody>
				{#each brews as brew}
					<tr>
						<th
							><a href="/coffees/{brew.coffeeId}">
								{#if brew.coffee.country}
									{getCoffeeFlag(brew.coffee.country)}
								{/if}
								{brew.coffee.name}
							</a></th
						>
						<td class="max-w-20">{brew.weight}g</td>
						<td>{formatDateTime(brew.consumptionDate)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
