<script lang="ts">
	import type { Process } from '$lib/zod-schemas.js';
	import { getCountryCode, getEmojiFlag, type TCountryCode } from 'countries-list';
	import { ArrowDownZa, ArrowUpAz, X } from 'lucide-svelte';

	let { data } = $props();
	const tableEntries = $state(data.tableEntries);

	type TableEntry = (typeof tableEntries)[number];
	type TableEntryKey = keyof TableEntry;

	// FILTERING
	type Filter = { key: TableEntryKey; value: TableEntry[TableEntryKey] };
	let filters: Filter[] = $state([]);
	let filteredEntries = $derived(
		tableEntries.filter((tableEntry) => {
			return !filters.some(({ key, value }) => tableEntry[key] !== value);
		})
	);

	// SORTING
	let sortedBy: { key: TableEntryKey; ascending: boolean } = $state({
		key: 'roastingDate',
		ascending: true
	});

	let sortedEntries = $derived(
		filteredEntries.toSorted((a, b) => {
			const aVal = a[sortedBy.key];
			const bVal = b[sortedBy.key];
			const aNull = aVal == null;
			const bNull = bVal == null;
			if (aNull && bNull) {
				return 0;
			}
			if (aNull) {
				return 1;
			}
			if (bNull) {
				return -1;
			}
			if (aVal === bVal) {
				return 0;
			}
			if (aVal < bVal) {
				return sortedBy.ascending ? -1 : 1;
			} else {
				return sortedBy.ascending ? 1 : -1;
			}
		})
	);

	// MISC
	const processColorMap: Record<Process, string> = {
		washed: 'badge-success',
		honey: 'badge-warning',
		natural: 'badge-error',
		advanced: 'badge-primary'
	};
</script>

{#snippet tableHead(fieldName: TableEntryKey, headerName: string | undefined = undefined)}
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
					{@render tableHead('dosesRemaining', 'Doses')}
					{@render tableHead('dosesBrewed', 'Brews')}
					{@render tableHead('roastingDate', 'Roasted')}
				</tr>
			</thead>
			<tbody>
				{#each sortedEntries as coffee (coffee.id)}
					<tr class="hover:bg-base-300 content-center">
						<th><a href="/coffees/{coffee.id}">{coffee.name}</a></th>
						<td>
							{#if coffee.country}
								<button
									onclick={() => {
										filters = [...filters, { key: 'country', value: coffee.country }];
									}}
								>
									{`${getEmojiFlag(getCountryCode(coffee.country) as TCountryCode)} ${coffee.country}`}
								</button>
							{:else}
								❔ Unknown
							{/if}
						</td>
						<td>
							{#if coffee.varietals}
								<button
									onclick={() => {
										filters = [...filters, { key: 'varietals', value: coffee.varietals }];
									}}>{coffee.varietals}</button
								>
							{:else}
								Unknown
							{/if}
						</td>
						<td
							><button
								onclick={() => {
									filters = [...filters, { key: 'roaster', value: coffee.roaster }];
								}}>{coffee.roaster}</button
							></td
						>
						<td>
							{#if coffee.process}
								<div class="tooltip" data-tip={coffee.processDetails}>
									<div class="badge badge-soft {processColorMap[coffee.process]}">
										{coffee.process}
									</div>
								</div>
							{:else}
								Unknown
							{/if}
						</td>
						<td>{coffee.dosesRemaining}</td>
						<td>{coffee.dosesBrewed}</td>
						<td>{coffee.roastingDate ?? 'Unknown'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
