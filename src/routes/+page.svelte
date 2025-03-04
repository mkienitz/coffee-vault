<script lang="ts">
	import { getCountryCode, getEmojiFlag, type TCountryCode } from 'countries-list';
	import { ArrowDownZa, ArrowUpAz, X } from 'lucide-svelte';
	import type { CoffeeWithDoses } from '$lib/schemas';

	let { data } = $props();
	const coffees = $state(data.coffees);

	type CoffeeKey = keyof CoffeeWithDoses;

	// FILTERING
	type Filter = { key: CoffeeKey; value: CoffeeWithDoses[CoffeeKey] };
	let filters: Filter[] = $state([]);
	let filteredCoffees = $derived(
		coffees.filter((coffee) => {
			return !filters.some(({ key, value }) => coffee[key] !== value);
		})
	);
	$inspect(filters);

	// SORTING
	let sortedBy: { key: CoffeeKey; ascending: boolean } = $state({
		key: 'roastingDate',
		ascending: true
	});

	let sortedCoffees = $derived(
		filteredCoffees.toSorted((a, b) => {
			if (a[sortedBy.key] === b[sortedBy.key]) {
				return 0;
			}
			if (a[sortedBy.key] < b[sortedBy.key]) {
				return sortedBy.ascending ? -1 : 1;
			} else {
				return sortedBy.ascending ? 1 : -1;
			}
		})
	);

	// PAGINATION
	//const pageSize = 15;
	//const nPages = $derived(Math.ceil(filteredCoffees.length / pageSize));
	//let currPage = $state(data.page);
	//$effect(() => {
	//	currPage = Math.min(data.page, nPages);
	//});
	//
	//let paginatedCoffees = $derived(
	//	sortedCoffees.slice((currPage - 1) * pageSize, (currPage - 1) * pageSize + pageSize)
	//);
	//$effect(() => {
	//	goto(`?page=${currPage}`);
	//});
</script>

{#snippet tableHead(fieldName: CoffeeKey, headerName: string | undefined = undefined)}
	<th scope="col">
		<button
			class="flex flex-row"
			onclick={() => {
				if (sortedBy.key == fieldName) {
					sortedBy.ascending = !sortedBy.ascending;
				}
				sortedBy.key = fieldName;
			}}
			>{headerName ?? fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
			{#if sortedBy.key === fieldName}
				{#if sortedBy.ascending}
					<ArrowUpAz />
				{:else}
					<ArrowDownZa />
				{/if}
			{/if}
		</button>
	</th>
{/snippet}

<div class="flex w-full flex-row justify-between">
	<!-- FILTER CONTROLS -->
	<div class="flex flex-row space-x-2">
		{#each filters as filter}
			<button
				class="btn hover:bg-error"
				onclick={() => {
					filters = filters.filter((f) => f !== filter);
				}}
			>
				{filter.value}<X class="size-4" />
			</button>
		{/each}
		<button
			class="btn"
			onclick={() => {
				filters = [];
			}}>Reset Filters</button
		>
	</div>
	<button class="btn btn-primary"><a href="/coffees">Add Coffee</a></button>
</div>

<table class="table">
	<thead>
		<tr>
			{@render tableHead('name')}
			{@render tableHead('country')}
			{@render tableHead('varietals')}
			{@render tableHead('roaster')}
			{@render tableHead('process')}
			{@render tableHead('roastingDate', 'Roasted')}
		</tr>
	</thead>
	<tbody>
		{#each sortedCoffees as coffee (coffee.id)}
			<tr class="content-center">
				<th><a href="/coffees/{coffee.id}/doses">{coffee.name}</a></th>
				<td>
					<button
						onclick={() => {
							filters = [...filters, { key: 'country', value: coffee.country }];
						}}
					>
						{`${getEmojiFlag(getCountryCode(coffee.country) as TCountryCode)} ${coffee.country}`}
					</button>
				</td>
				<td
					><button
						onclick={() => {
							filters = [...filters, { key: 'varietals', value: coffee.varietals }];
						}}>{coffee.varietals}</button
					></td
				>
				<td
					><button
						onclick={() => {
							filters = [...filters, { key: 'roaster', value: coffee.roaster }];
						}}>{coffee.roaster}</button
					></td
				>
				<td>
					<div class="badge badge-primary">washed</div>
				</td>
				<td class="text-center">{coffee.roastingDate}</td>
			</tr>
		{/each}
	</tbody>
</table>
