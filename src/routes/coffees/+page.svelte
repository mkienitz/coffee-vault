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

<div class="mx-auto w-full max-w-screen-2xl">
	<div class="mb-4 flex w-full flex-row justify-between gap-4">
		<!-- FILTER CONTROLS -->
		<div class="flex flex-row flex-wrap gap-2">
			<button
				disabled={filters.length == 0}
				class="btn btn-primary btn-sm"
				onclick={() => {
					filters = [];
				}}>Reset Filters</button
			>
			{#each filters as filter}
				<button
					class="btn btn-sm hover:bg-error"
					onclick={() => {
						filters = filters.filter((f) => f !== filter);
					}}
				>
					{filter.value}<X class="size-4" />
				</button>
			{/each}
		</div>
		<a href="/coffees/new" class="btn btn-success btn-sm sm:btn-md w-fit">Add Coffee</a>
	</div>
	<div class="w-full overflow-x-auto">
		<table class="table-pin-rows table-zebra table w-full min-w-max">
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
					<tr class="hover">
						<th class="whitespace-nowrap"
							><a href="/coffees/{coffee.id}" class="link">{coffee.name}</a></th
						>
						<td class="whitespace-nowrap">
							{#if coffee.country}
								<button
									class="btn btn-ghost btn-xs"
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
						<td class="whitespace-nowrap">
							{#if coffee.varietals}
								<button
									class="btn btn-ghost btn-xs"
									onclick={() => {
										filters = [...filters, { key: 'varietals', value: coffee.varietals }];
									}}>{coffee.varietals}</button
								>
							{:else}
								Unknown
							{/if}
						</td>
						<td class="whitespace-nowrap"
							><button
								class="btn btn-ghost btn-xs"
								onclick={() => {
									filters = [...filters, { key: 'roaster', value: coffee.roaster }];
								}}>{coffee.roaster}</button
							></td
						>
						<td class="whitespace-nowrap">
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
						<td class="text-center whitespace-nowrap">{coffee.dosesRemaining}</td>
						<td class="text-center whitespace-nowrap">{coffee.dosesBrewed}</td>
						<td class="whitespace-nowrap">{coffee.roastingDate ?? 'Unknown'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
