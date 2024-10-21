<script lang="ts">
	import { getCountryCode, getEmojiFlag, type TCountryCode } from 'countries-list';
	import { ArrowDownZa, ArrowUpAz } from 'lucide-svelte';
	import type { CoffeeWithDoses } from '$lib/schemas';

	let { data } = $props();
	const coffees = $state(data.coffees);

	type CoffeeField = keyof CoffeeWithDoses;

	// FILTERING
	type Filter = { field: CoffeeField; value: CoffeeWithDoses[CoffeeField] } | undefined;

	let currentFilter: Filter = $state(undefined);
	let filteredCoffees = $derived(
		coffees.filter((coffee) =>
			currentFilter ? coffee[currentFilter.field] === currentFilter.value : true
		)
	);

	// SORTING
	type SortingFunction = (a: CoffeeWithDoses, b: CoffeeWithDoses) => number;
	let sortedBy = $state('roastingDate' as CoffeeField);
	let ascending = $state(true);

	const createSortingFunction: (field: CoffeeField) => SortingFunction = (field) => {
		return (c1, c2) => {
			const accessor = (coffee: CoffeeWithDoses) =>
				coffee[field as keyof typeof coffee].toString().toLowerCase();
			if (accessor(c1) === accessor(c2)) {
				return 0;
			}
			if (accessor(c1) < accessor(c2)) {
				return ascending ? -1 : 1;
			} else {
				return ascending ? 1 : -1;
			}
		};
	};

	let currentSortingFunction: SortingFunction = $derived(createSortingFunction(sortedBy));
	let sortedCoffees = $derived(filteredCoffees.toSorted(currentSortingFunction));
</script>

{#snippet tableHead(field: CoffeeField, headerName: string | undefined = undefined)}
	<th
		scope="col"
		role="link"
		class="contrast"
		onclick={() => {
			if (sortedBy === field) {
				ascending = !ascending;
			}
			sortedBy = field;
		}}
		>{headerName ?? field.charAt(0).toUpperCase() + field.slice(1)}
		{#if sortedBy === field}
			{#if ascending}
				<ArrowUpAz />
			{:else}
				<ArrowDownZa />
			{/if}
		{/if}
	</th>
{/snippet}

<div role="group">
	<button
		onclick={() => {
			currentFilter = undefined;
		}}>Reset Filters</button
	>
	<a href="/coffees" type="button" class="secondary">Add Coffee</a>
</div>
<table>
	<thead>
		<tr>
			{@render tableHead('name')}
			{@render tableHead('country')}
			{@render tableHead('varietals')}
			{@render tableHead('roaster')}
			{@render tableHead('process')}
			{@render tableHead('roastingDate', 'Roast Date')}
		</tr>
	</thead>
	<tbody>
		{#each sortedCoffees as coffee}
			{#snippet tableElement(field: keyof CoffeeWithDoses, value: string | undefined = undefined)}
				<td
					role="link"
					class="secondary"
					onclick={() => {
						currentFilter = { field, value: coffee[field] };
					}}
				>
					{value ?? coffee[field]}
				</td>
			{/snippet}

			<tr>
				<th><a class="contrast" href="/coffees/{coffee.id}/doses">{coffee.name}</a></th>
				{@render tableElement(
					'country',
					`${getEmojiFlag(getCountryCode(coffee.country) as TCountryCode)} ${coffee.country}`
				)}
				{@render tableElement('varietals')}
				{@render tableElement('roaster')}
				<td data-tooltip={coffee.process}>washed</td>
				<td>{coffee.roastingDate}</td>
			</tr>
		{/each}
	</tbody>
	<tfoot> </tfoot>
</table>
