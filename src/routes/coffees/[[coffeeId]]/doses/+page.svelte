<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as Form from '$lib/components/ui/form';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { doseSchema } from '$lib/schemas.js';
	import { Input } from '$lib/components/ui/input';
	let { data } = $props();
	const coffee = $derived(data.coffee);
	const doses = $derived(coffee.doses);

	const sForm = superForm(data.form, {
		resetForm: false,
		validators: zodClient(doseSchema)
	});
	const { form, enhance, formId } = sForm;
</script>

<form id="doseForm" method="POST" use:enhance class="flex flex-row items-end space-x-4">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head class="text-center">Weight</Table.Head>
				<Table.Head class="text-center">Token</Table.Head>
				<Table.Head class="text-center">Consumed</Table.Head>
				<Table.Head class="text-center"></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each doses as dose}
				<Table.Row>
					<Table.Cell class="max-w-[5rem] text-center">{dose.weight}g</Table.Cell>
					<Table.Cell class="max-w-[10rem] truncate text-center"
						><a href="./doses/{dose.id}">{dose.token}</a></Table.Cell
					>
					<Table.Cell class="text-center">{dose.consumedOn || '-'}</Table.Cell>
					<Table.Cell class="flex flex-row">
						<Form.Button
							variant="destructive"
							class="flex-grow"
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
								class="max-w-[6rem]"
								bind:value={$form.weight}
							/>
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</Table.Cell>
				<Table.Cell></Table.Cell>
				<Table.Cell></Table.Cell>
				<Table.Cell class="flex flex-row">
					<Form.Button
						class="flex-grow"
						onclick={() => {
							$formId = 'add';
						}}
						formaction="?/add">Add Dose</Form.Button
					>
				</Table.Cell>
			</Table.Row>
		</Table.Body>
	</Table.Root>
	<input hidden bind:value={$form.coffeeId} name="coffeeId" />
</form>
<!-- <SuperDebug data={$form} /> -->
