<script lang="ts">
	import CoffeeCard from '$lib/components/CoffeeCard.svelte';
	import { type Dose, type Brew } from '$lib/zod-schemas';
	import { getTubeName } from '$lib/utils';
	const { data } = $props();
	const coffee = data.coffee;
	const dose = data.dose;

	let consumeDialog: HTMLDialogElement | undefined = $state(undefined);
</script>

<div class="flex flex-col items-center space-y-8">
	{#if coffee}
		{@const doses = coffee.doses as Dose[]}
		{@const brews = coffee.brews as Brew[]}
		<CoffeeCard {coffee} {doses} {brews} />
		<span>This tube holds {dose.weight}g of coffee</span>
		<form method="POST" id="consumeForm">
			<input hidden name="drawer" value={dose.drawer} />
			<input hidden name="tubeNumber" value={dose.tubeNumber} />
			<input type="hidden" name="__superform_id" value={getTubeName(dose)} />
		</form>
		<button class="btn btn-primary" onclick={() => consumeDialog!.showModal()}
			>Mark as Consumed</button
		>
		<dialog bind:this={consumeDialog} class="modal">
			<div class="modal-box">
				<h3>Are you sure?</h3>
				<p class="py-4">Marking the coffee as consumed cannot be undone!</p>
				<div class="modal-action">
					<form method="dialog">
						<button class="btn">Cancel</button>
						<input
							type="submit"
							form="consumeForm"
							formaction="/coffees/{coffee.id}?/consume"
							value="Consume"
							class="btn btn-primary"
						/>
					</form>
				</div>
			</div>
		</dialog>
	{:else}
		<span>This tube is currently empty</span>
	{/if}
</div>
