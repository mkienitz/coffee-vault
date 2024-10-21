<script>
	import CoffeeCard from '$lib/components/coffee-card.svelte';
	const { data } = $props();
	const coffee = data.coffee;
	const dose = data.dose;
</script>

<CoffeeCard {coffee} />
{#if dose.consumedOn}
	<span>This Dose has already been consumed on {dose.consumedOn}</span>
{:else}
	<form method="POST">
		<button name="id" value={dose.id} formaction="/coffees/{coffee.id}/doses?/consume"
			>Mark {dose.weight}g as consumed</button
		>
		<input type="hidden" name="__superform_id" value={dose.id.toString()} />
	</form>
{/if}
