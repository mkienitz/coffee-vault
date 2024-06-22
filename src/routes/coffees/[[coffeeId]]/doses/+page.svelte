<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as Form from '$lib/components/ui/form';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { doseSchema } from '$lib/schemas.js';
	import { Input } from '$lib/components/ui/input';
	import CoffeeCard from '$lib/components/coffee-card.svelte';
	import { Progress } from '$lib/components/ui/progress';
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

	const dosed = $derived(doses.map((dose) => dose.weight).reduce((a, b) => a + b, 0));
	const consumed = $derived(
		doses
			.filter((dose) => dose.consumedOn)
			.map((dose) => dose.weight)
			.reduce((a, b) => a + b, 0)
	);
</script>

<CoffeeCard bind:coffee />
<div class="flex w-1/3 flex-col">
	<div class="flex items-center justify-between">
		Dosed: <Progress class="w-1/2" value={dosed} max={coffee.weight} />
	</div>
	<div class="flex items-center justify-between">
		Remaining: <Progress class="w-1/2" value={coffee.weight - consumed} max={coffee.weight} />
	</div>
</div>
<form id="doseForm" method="POST" use:enhance class="w-[75%]">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head class="text-center">Weight</Table.Head>
				<Table.Head class="text-center">Token</Table.Head>
				<Table.Head class="text-center">Consumed</Table.Head>
				<Table.Head class="text-center">Printed</Table.Head>
				<Table.Head class="text-center"></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each doses as dose}
				<Table.Row>
					<Table.Cell class="max-w-[5rem] text-center">{dose.weight}g</Table.Cell>
					<Table.Cell class="max-w-[10rem] truncate text-center"
						><a href="/doses/{dose.token}">{dose.token}</a></Table.Cell
					>
					<Table.Cell class="text-center">
						{#if dose.consumedOn}
							{dose.consumedOn}
						{:else}
							<Form.Button
								variant="secondary"
								name="id"
								value={dose.id}
								onclick={() => {
									$formId = dose.id.toString();
								}}
								formaction="?/consume">Mark as consumed</Form.Button
							>
						{/if}
					</Table.Cell>
					<Table.Cell class="text-center">
						{#if !dose.consumedOn}
							<Form.Button
								variant={dose.printed ? 'outline' : 'secondary'}
								name="id"
								value={dose.id}
								onclick={() => {
									$formId = dose.id.toString();
								}}
								formaction="?/print">Print {dose.printed ? 'again' : ''}</Form.Button
							>
						{/if}
					</Table.Cell>
					<Table.Cell class="text-center">
						<Form.Button
							variant="destructive"
							name="id"
							value={dose.id}
							onclick={() => {
								$formId = dose.id.toString();
							}}
							formaction="?/delete">Delete Dose</Form.Button
						>
					</Table.Cell>
				</Table.Row>
			{/each}
			<Table.Row>
				<Table.Cell>
					<Form.Field form={sForm} name="weight">
						<Form.Control let:attrs>
							<Input
								{...attrs}
								type="number"
								min="1"
								max="50"
								placeholder="12.5"
								step="0.5"
								class="m-auto block max-w-[6rem]"
								bind:value={$form.weight}
							/>
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</Table.Cell>
				<Table.Cell class="text-center">
					<Form.Button
						onclick={() => {
							$formId = 'add';
						}}
						formaction="?/add">Add Dose</Form.Button
					>
				</Table.Cell>
				<Table.Cell></Table.Cell>
				<Table.Cell class="text-center">
					<Form.Button
						disabled={coffee.doses.every((d) => d.printed || d.consumedOn)}
						variant="secondary"
						onclick={() => {
							$formId = 'printAll';
						}}
						formaction="?/printAll">Print All</Form.Button
					>
				</Table.Cell>
				<Table.Cell></Table.Cell>
			</Table.Row>
		</Table.Body>
	</Table.Root>
	<input hidden bind:value={$form.coffeeId} name="coffeeId" />
</form>
