<script lang="ts">
	import { getCoffeeFlag } from '$lib/utils';
	let { data } = $props();
</script>

<div class="prose flex flex-col items-center">
<h2>All Brews</h2>
<p>{data.brews.length} brews recorded so far!</p> 
<table class="table max-w-fit">
	<thead>
		<tr>
			<th scope="col" class="text-center">Coffee</th>
			<th scope="col" class="text-center">Weight</th>
			<th scope="col" class="text-center">Brewed on</th>
		</tr>
	</thead>
	<tbody>
		{#each data.brews as brew}
			<tr>
				<th class="text-center"><a href="/coffees/{brew.coffee.id}">{getCoffeeFlag(brew.coffee)} {brew.coffee.name}</a></th>
				<td class="max-w-[5rem] text-center">{brew.weight}g</td>
				<td class="text-center">{brew.consumptionDate}</td>
			</tr>
		{/each}
	</tbody>
</table>
</div>
