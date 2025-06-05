<script lang="ts">
	import { getCoffeeFlag } from '$lib/utils';
	let { data } = $props();
</script>

<div class="flex flex-col items-center">
	<h2 class="mb-8 text-2xl font-bold">All Brews</h2>
	{#if data.brews.length === 0}
		<span class="self-center">There are no recoded brews</span>
	{:else}
		<p>{data.brews.length} brews recorded so far!</p>
		<table class="mt-8 table max-w-fit">
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
