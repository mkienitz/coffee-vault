<script lang="ts">
	import { getCountryCode, getEmojiFlag, type TCountryCode } from 'countries-list';
	import { ArrowDownZa, ArrowUpAz, X } from 'lucide-svelte';

	let { data } = $props();
	const coffees = $state(data.coffees);

	type Coffee = (typeof coffees)[number];
	type CoffeeKey = keyof Coffee;

	// FILTERING
	type Filter = { key: CoffeeKey; value: Coffee[CoffeeKey] };
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
</script>

{#snippet tableHead(fieldName: CoffeeKey, headerName: string | undefined = undefined)}
	<th scope="col" class="max-w-fit">
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

<div>
	<div class="flex w-full flex-row justify-between">
		<!-- FILTER CONTROLS -->
		<div class="flex flex-row space-x-2">
			<button
				disabled={filters.length == 0}
				class="btn btn-primary"
				onclick={() => {
					filters = [];
				}}>Reset Filters</button
			>
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
		</div>
		<a href="/coffees/new" class="btn btn-success">Add Coffee</a>
	</div>
	<div class="overflow-x-auto">
		<table class="table-pin-rows table">
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
					<tr class="hover:bg-base-300 content-center">
						<th><a href="/coffees/{coffee.id}">{coffee.name}</a></th>
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
							<div class="tooltip" data-tip={coffee.process}>
								<div class="badge badge-primary">washed</div>
							</div>
						</td>
						<td>{coffee.roastingDate}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
