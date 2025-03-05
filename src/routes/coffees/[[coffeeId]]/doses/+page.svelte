<script lang="ts">
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { doseSchema } from '$lib/schemas.js';
	import CoffeeCard from '$lib/components/coffee-card.svelte';

	let { data } = $props();
	let coffee = $state(data.coffee);
	$effect(() => {
		coffee = data.coffee;
	});
	const doses = $derived(coffee.doses);

	const {form, enhance, formId } = superForm(data.form, {
		validators: zodClient(doseSchema)
	});
</script>

<div class="flex flex-col items-center space-y-8">
	<CoffeeCard bind:coffee />
	<form method="POST" use:enhance class="w-full">
		<table>
			<thead>
				<tr>
					<th scope="col" class="text-center">Weight</th>
					<th scope="col" class="text-center">Token</th>
					<th scope="col" class="text-center">Consumed</th>
					<th scope="col" class="text-center">Printed</th>
					<th scope="col" class="text-center"></th>
				</tr>
			</thead>
			<tbody>
				{#each doses as dose}
					<tr>
						<td class="max-w-[5rem] text-center">{dose.weight}g</td>
						<td class="max-w-[10rem] truncate text-center"
							><a href="/doses/{dose.token}">{dose.token}</a></td
						>
						<td class="text-center">
							{#if dose.consumedOn}
								{dose.consumedOn}
							{:else}
								<button
									name="id"
									class="btn btn-primary"
									value={dose.id}
									onclick={() => {
										$formId = dose.id.toString();
									}}
									formaction="?/consume">Mark as consumed</button
								>
							{/if}
						</td>
						<td class="text-center">
							{#if !dose.consumedOn}
								<button
									name="id"
									class="btn {!dose.printed ? 'btn-primary' : ''}"
									value={dose.id}
									onclick={() => {
										$formId = dose.id.toString();
									}}
									formaction="?/print">Print {dose.printed ? 'again' : ''}</button
								>
							{/if}
						</td>
						<td class="text-center">
							<button
								name="id"
								class="btn btn-error"
								value={dose.id}
								onclick={() => {
									$formId = dose.id.toString();
								}}
								formaction="?/delete">Delete Dose</button
							>
						</td>
					</tr>
				{/each}
				<tr>
					<td>
						<label class="input">
							<input
								name="weight"
								type="number"
								min="1"
								max="50"
								placeholder="12.5"
								step="0.5"
								class="input m-auto block max-w-[6rem]"
								bind:value={$form.weight}
							/>
							<span class="label">g</span>
						</label>
					</td>
					<td class="text-center">
						<button
							class="btn btn-success"
							type="submit"
							onclick={() => {
								$formId = 'add';
							}}
							formaction="?/add">Add Dose</button
						>
					</td>
					<td></td>
					<td class="text-center">
						<button
							disabled={coffee.doses.every((d) => d.printed || d.consumedOn)}
							class="btn btn-primary"
							onclick={() => {
								$formId = 'printAll';
							}}
							formaction="?/printAll">Print All</button
						>
					</td>
					<td></td>
				</tr>
			</tbody>
		</table>
		<input hidden bind:value={$form.coffeeId} name="coffeeId" />
	</form>
</div>
<SuperDebug data={$form} />
