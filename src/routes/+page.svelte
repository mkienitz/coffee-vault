<script lang="ts">
	import Plus from 'lucide-svelte/icons/plus';
	import { getFilteredIdsAndData } from './data.remote';
	import CoffeeCard from '$lib/components/CoffeeCard.svelte';
	import Funnel from 'lucide-svelte/icons/funnel';
	import Coffee from 'lucide-svelte/icons/coffee';
	import ArrowDownUp from 'lucide-svelte/icons/arrow-down-up';
	import { coffeeFilterSchema } from '$lib/validation';
	import * as v from 'valibot';
	import { coffeeFilterColumns } from '$lib/constants';

	// Filter
	let filterDialog: HTMLDialogElement | undefined = $state(undefined);

	type FilterSettings = v.InferOutput<typeof coffeeFilterSchema>;
	let filterSettings: FilterSettings = $state({});
	let newFilterSettings: FilterSettings = $state({});

	// Data
	const dataPromise = $derived(getFilteredIdsAndData(filterSettings));
	const data = $derived(await dataPromise);
</script>

<div class="fab">
	<!-- a focusable div with tabindex is necessary to work on all browsers. role="button" is necessary for accessibility -->
	<div tabindex="0" role="button" class="btn btn-lg btn-circle btn-secondary">
		<Coffee />
	</div>

	<!-- buttons that show up when FAB is open -->
	<button class="btn btn-lg btn-circle">
		<a href="/coffees/new" class="btn btn-lg btn-circle btn-success"><Plus /></a>
	</button>
	<button class="btn btn-lg btn-circle">
		<ArrowDownUp />
	</button>
	<button
		class="btn btn-lg btn-circle"
		onclick={() => {
			newFilterSettings = { ...filterSettings };
			filterDialog?.showModal();
		}}
	>
		<Funnel />
	</button>
</div>

<div class="mx-auto w-full max-w-screen-2xl p-4">
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each data.coffeeIds as coffeeId (coffeeId)}
			<CoffeeCard {coffeeId} />
		{/each}
	</div>
</div>

<dialog class="modal" bind:this={filterDialog}>
	<div class="modal-box">
		<h3 class="text-lg font-bold">Filter Settings</h3>
		<div class="modal-action flex flex-col">
			<form class="flex w-full flex-col gap-2">
				{#each coffeeFilterColumns as filterColumn}
					{@const availableValues = data.availableValues[filterColumn]}
					<div class="flex w-full gap-2">
						<select class="select flex-1" bind:value={newFilterSettings[filterColumn]}>
							<option disabled value={undefined}>Select {filterColumn}</option>
							<!-- Enumerate current values for this column -->
							{#each availableValues as availableValue}
								<option value={availableValue}>{availableValue}</option>
							{/each}
						</select>
						<button
							class="btn w-20"
							onclick={(e) => {
								e.preventDefault();
								newFilterSettings[filterColumn] = undefined;
							}}>Reset</button
						>
					</div>
				{/each}
				<!-- state should only be updated upon pressing Apply -->
			</form>
			<form method="dialog" class="flex justify-end gap-2">
				<button class="btn">Cancel</button>
				<button
					class="btn btn-primary"
					onclick={() => {
						filterSettings = { ...newFilterSettings };
					}}>Apply</button
				>
			</form>
		</div>
	</div>
</dialog>
