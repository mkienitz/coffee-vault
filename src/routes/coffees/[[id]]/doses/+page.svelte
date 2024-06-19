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

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head>Weight</Table.Head>
			<Table.Head>Token</Table.Head>
			<Table.Head>Consumed</Table.Head>
			<Table.Head></Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each doses as dose}
			<Table.Row>
				<Table.Cell>{dose.weight}g</Table.Cell>
				<Table.Cell>{dose.token}</Table.Cell>
				<Table.Cell>{dose.consumedOn || '-'}</Table.Cell>
				<Table.Cell>
					<Form.Button
						variant="destructive"
						name="id"
						value={dose.id}
						onclick={() => ($formId = dose.id.toString())}
						form="doseForm"
						formaction="?/delete">Delete Dose</Form.Button
					>
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>

<form
	id="doseForm"
	method="POST"
	action="?/add"
	use:enhance
	class="flex flex-row items-end space-x-4"
>
	<Form.Field form={sForm} name="weight">
		<Form.Control let:attrs>
			<Form.Label>Weight</Form.Label>
			<Input {...attrs} type="number" bind:value={$form.weight} />
		</Form.Control>
		<!-- Here is a hidden aria element that's affected by space-y-2 -->
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="mb-2" onclick={() => ($formId = 'add')}>Add</Form.Button>
	<input hidden bind:value={$form.coffeeId} name="coffeeId" />
</form>
<SuperDebug data={$form} />
