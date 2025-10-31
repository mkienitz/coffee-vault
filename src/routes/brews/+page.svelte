<script lang="ts">
	import { getCoffeeFlag } from '$lib/utils';
	import { sum, unique } from 'radash';
	let { data } = $props();
	const totalBrews = $derived(data.brews.length);
	const totalCoffees = $derived(unique(data.brews.map((brew) => brew.coffeeId)).length);
	const totalWeight = $derived(sum(data.brews.map((brew) => brew.weight)));
</script>

<div class="flex flex-col items-center">
	{#if data.brews.length === 0}
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
				{#each data.brews as brew}
					<tr>
						<th
							><a href="/coffees/{brew.coffee.id}"
								>{getCoffeeFlag(brew.coffee)} {brew.coffee.name}</a
							></th
						>
						<td class="max-w-[5rem]">{brew.weight}g</td>
						<td>{brew.consumptionDate}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
