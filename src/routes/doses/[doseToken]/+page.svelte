<script>
	import * as Form from '$lib/components/ui/form';
	const { data } = $props();
	const coffee = data.coffee;
	const dose = data.dose;
</script>

<span>{dose.weight}g of {coffee.name}</span>

{#if dose.consumedOn}
	This Dose has already been consumed on {dose.consumedOn}
{:else}
	<form method="POST">
		<Form.Button
			class="w-full"
			variant="secondary"
			name="id"
			value={dose.id}
			formaction="/coffees/{coffee.id}/doses?/consume">Mark as consumed</Form.Button
		>
		<input type="hidden" name="__superform_id" value={dose.id.toString()} />
	</form>
{/if}
