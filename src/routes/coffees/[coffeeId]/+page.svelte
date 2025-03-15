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

	const { form: creationForm, enhance: creationEnhance } = superForm(data.creationForm, {
		resetForm: false
	});
	const { enhance: managementEnhance, formId: managementId } = superForm(data.managementForm);
</script>

<div class="flex flex-col items-center space-y-8">
	<CoffeeCard {coffee} {doses} />

	<div class="flex w-full flex-col space-y-4">
		<form id="creationForm" method="POST" use:creationEnhance class="self-end">
			<label class="input max-w-fit">
				<input
					name="weight"
					type="number"
					min="1"
					max="20"
					placeholder="12.5"
					step="0.5"
					bind:value={$creationForm.weight}
					class="w-[3rem]"
				/>
				<span class="label">g</span>
			</label>
			<input
				type="submit"
				value="Add Dose"
				form="creationForm"
				formaction="?/add"
				class="btn btn-success"
			/>
		</form>

		<table class="table">
			<thead>
				<tr>
					<th scope="col" class="text-center">Tube</th>
					<th scope="col" class="text-center">Weight</th>
					<th scope="col" class="text-center">Created</th>
					<th scope="col" class="text-center"></th>
				</tr>
			</thead>
			<tbody>
				{#each doses as dose}
					{@const tubeName = `${dose.drawer}${dose.tubeNumber}`}
					<tr>
						<td class="max-w-[5rem] text-center"><a href="/doses/{tubeName}">{tubeName}</a></td>
						<td class="max-w-[5rem] text-center">{dose.weight}g</td>
						<td class="text-center">
							{dose.createdOn}
						</td>
						<td class="text-center">
							<form id="managementForm" method="POST" use:managementEnhance>
								<input hidden name="drawer" value={dose.drawer} />
								<input hidden name="tubeNumber" value={dose.tubeNumber} />
								<input
									type="submit"
									value="Delete Dose"
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
	</div>
</div>
