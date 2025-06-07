<script lang="ts">
	import CoffeeCard from '$lib/components/CoffeeCard.svelte';
	import type { Dose } from '$lib/zod-schemas';
	import { superForm } from 'sveltekit-superforms';

	let { data } = $props();
	let coffee = $state(data.coffee);

	$effect(() => {
		coffee = data.coffee;
	});

	const doses = $derived(coffee.doses as Dose[]);
	// TODO: sort with recents on top
	const brews = $derived(coffee.brews);
	const leftToDose = $derived(
		coffee.weight -
			brews.reduce((acc, brew) => acc + brew.weight, 0) -
			doses.reduce((acc, dose) => acc + dose.weight, 0)
	);

	const { form: creationForm, enhance: creationEnhance } = superForm(data.creationForm, {
		resetForm: false
	});
	const { enhance: managementEnhance, formId: managementId } = superForm(data.managementForm);
</script>

{#snippet DoseTable()}
	<table class="table">
		<thead>
			<tr>
				<th scope="col" class="text-center">Tube</th>
				<th scope="col" class="text-center">Weight</th>
				<th scope="col" class="text-center">Created</th>
				<th scope="col"></th>
				<th scope="col"></th>
			</tr>
		</thead>
		<tbody>
			{#each doses as dose}
				{@const tubeName = `${dose.drawer}${dose.tubeNumber}`}
				<tr>
					<td class="max-w-[5rem] text-center"
						><a href="/doses/{tubeName}" class="link font-bold">{tubeName}</a></td
					>
					<td class="max-w-[5rem] text-center">{dose.weight}g</td>
					<td class="text-center">
						{dose.creationDate}
					</td>
					<td class="text-center">
						<form id="managementForm" method="POST" use:managementEnhance>
							<input hidden name="drawer" value={dose.drawer} />
							<input hidden name="tubeNumber" value={dose.tubeNumber} />
							<input
								type="submit"
								value="Consume"
								onclick={() => {
									$managementId = tubeName;
								}}
								formaction="?/consume"
								class="btn btn-primary"
							/>
						</form>
					</td>
					<td class="text-center">
						<form id="managementForm" method="POST" use:managementEnhance>
							<input hidden name="drawer" value={dose.drawer} />
							<input hidden name="tubeNumber" value={dose.tubeNumber} />
							<input
								type="submit"
								value="Delete"
								onclick={() => {
									$managementId = tubeName;
								}}
								formaction="?/delete"
								class="btn btn-error"
							/>
						</form>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/snippet}

{#snippet DoseCreatePanel()}
	<div class="flex place-content-between items-center">
		<span>Left to dose: {leftToDose}g</span>
		<form id="creationForm" method="POST" use:creationEnhance class="space-x-2">
			<label class="input max-w-fit">
				<input
					name="weight"
					type="number"
					min="1"
					max="20"
					placeholder="12.5"
					step="0.5"
					bind:value={$creationForm.weight}
					class="max-w-[3.5rem]"
				/>
				<span class="label">g</span>
			</label>
			<input
				type="submit"
				value="Add Dose"
				form="creationForm"
				formaction="?/add"
				disabled={$creationForm.weight > leftToDose}
				class="btn btn-success"
			/>
		</form>
	</div>
{/snippet}

<div class="grid grid-cols-1 justify-items-center space-y-8">
	<CoffeeCard {coffee} {doses} {brews} />
	<div class="prose flex w-full flex-col">
		<h2>Doses</h2>
		{@render DoseCreatePanel()}
		{#if doses.length === 0}
			<span class="mt-8 self-center">There are currently no doses</span>
		{:else}
			{@render DoseTable()}
		{/if}
	</div>
	<div class="prose flex w-full flex-col">
		<h2>Brews</h2>
		{#if brews.length === 0}
			<span class="self-center">There are no recorded brews</span>
		{:else}
			<table class="table">
				<thead>
					<tr>
						<th scope="col" class="text-center">Weight</th>
						<th scope="col" class="text-center">Brewed on</th>
					</tr>
				</thead>
				<tbody>
					{#each brews as brew}
						<tr>
							<td class="max-w-[5rem] text-center">{brew.weight}g</td>
							<td class="text-center">{brew.consumptionDate}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
