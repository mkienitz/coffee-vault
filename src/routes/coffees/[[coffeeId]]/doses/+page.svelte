<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { doseSchema } from '$lib/schemas.js';
	import CoffeeCard from '$lib/components/coffee-card.svelte';
	let { data } = $props();
	let coffee = $state(data.coffee);
	$effect(() => {
		coffee = data.coffee;
	});
	const doses = $derived(coffee.doses);

	const sForm = superForm(data.form, {
		resetForm: false,
		validators: zodClient(doseSchema)
	});
	const { form, enhance, formId } = sForm;
</script>

<CoffeeCard bind:coffee />
<form id="doseForm" method="POST" use:enhance class="w-full">
	<table>
		<thead>
			<tr>
				<th>Weight</th>
				<th>Token</th>
				<th>Consumed</th>
				<th>Printed</th>
			</tr>
		</thead>
		<tbody>
			{#each doses as dose}
				<tr>
					<td>{dose.weight}g</td>
					<td style="max-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
						><a class="contrast" href="/doses/{dose.token}">
							{dose.token}
						</a></td
					>
					<td>
						{#if dose.consumedOn}
							{dose.consumedOn}
						{:else}
							<button
								name="id"
								value={dose.id}
								onclick={() => {
									$formId = dose.id.toString();
								}}
								formaction="?/consume">Mark as consumed</button
							>
						{/if}
					</td>
					<td>
						{#if !dose.consumedOn}
							<button
								class={dose.printed ? 'outline' : ''}
								name="id"
								value={dose.id}
								onclick={() => {
									$formId = dose.id.toString();
								}}
								formaction="?/print">Print {dose.printed ? 'again' : ''}</button
							>
						{/if}
					</td>
					<td>
						<button
							name="id"
							value={dose.id}
							onclick={() => {
								$formId = dose.id.toString();
							}}
							formaction="?/delete">Delete Dose</button
						>
					</td>
				</tr>
			{/each}
		</tbody>
		<tfoot>
			<tr>
				<td>
					<input
						name="weight"
						type="number"
						min="1"
						max="50"
						placeholder="12.5"
						step="0.5"
						bind:value={$form.weight}
					/>
				</td>
				<td
					><button
						onclick={() => {
							$formId = 'add';
						}}
						formaction="?/add">Add Dose</button
					></td
				>
				<td></td>
				<td
					><button
						disabled={coffee.doses.every((d) => d.printed || d.consumedOn)}
						onclick={() => {
							$formId = 'printAll';
						}}
						formaction="?/printAll">Print All</button
					></td
				>
			</tr>
		</tfoot>
	</table>
	<input hidden bind:value={$form.coffeeId} name="coffeeId" />
</form>
