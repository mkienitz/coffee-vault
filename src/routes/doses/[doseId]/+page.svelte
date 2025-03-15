<script lang="ts">
	import CoffeeCard from '$lib/components/CoffeeCard.svelte';
	import { type Dose, type Brew } from '$lib/zod-schemas';
	import { getTubeName } from '$lib/utils';
	const { data } = $props();
	const coffee = data.coffee;
	const dose = data.dose;
</script>

<div class="flex flex-col items-center space-y-8">
	{#if coffee}
		{@const doses = coffee!.doses as Dose[]}
		{@const brews = coffee!.brews as Brew[]}
		<CoffeeCard {coffee} {doses} {brews} />
		<span>This tube holds {dose.weight}g of coffee</span>
		<form method="POST">
			<input
				type="submit"
				formaction="/coffees/{coffee.id}?/consume"
				value="Consume"
				class="btn btn-primary"
			/>
			<input hidden name="drawer" value={dose.drawer} />
			<input hidden name="tubeNumber" value={dose.tubeNumber} />
			<input type="hidden" name="__superform_id" value={getTubeName(dose)} />
		</form>
	{:else}
		<span>This tube is currently empty</span>
	{/if}
</div>
