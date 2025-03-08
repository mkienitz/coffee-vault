<script lang="ts">
	import CoffeeCard from '$lib/components/CoffeeCard.svelte';
	import { type Dose } from '$lib/zod-schemas';
	const { data } = $props();
	const { coffee, dose } = data;
</script>

<div class="flex flex-col items-center space-y-8">
	{#if coffee}
		<CoffeeCard {coffee} doses={coffee!.doses as Dose[]} />
		<!--
		<form method="POST">
			<button
				class="w-full"
				name="id"
				value={dose.id}
				formaction="/coffees/{coffee.id}/doses?/consume">Mark {dose.weight}g as consumed</button
			>
			<input type="hidden" name="__superform_id" value={dose.id.toString()} />
		</form>
		-->
		<span>This tube holds {dose.weight}g of coffee</span>
		<button class="btn btn-primary">Consume Button (WIP)</button>
	{:else}
		<span>This tube is currently empty</span>
	{/if}
</div>
