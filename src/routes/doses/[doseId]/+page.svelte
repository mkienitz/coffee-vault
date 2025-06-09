<script lang="ts">
	import CoffeeCard from '$lib/components/CoffeeCard.svelte';
	import { type Dose, type Brew } from '$lib/zod-schemas';
	const { data } = $props();
	const coffee = data.coffee;
	const dose = data.dose;

	let consumeDialog: HTMLDialogElement | undefined = $state(undefined);
</script>

{#snippet ConsumeButton()}
	<button class="btn btn-primary" onclick={() => consumeDialog!.showModal()}
		>Mark as Consumed</button
	>
	<dialog bind:this={consumeDialog} class="modal">
		<div class="modal-box">
			<h3>Are you sure?</h3>
			<p class="py-4">Marking the coffee as consumed cannot be undone!</p>
			<div class="modal-action">
				<form hidden method="POST" id="hiddenForm"></form>
				<form method="dialog">
					<button class="btn">Cancel</button>
					<input
						type="submit"
						form="hiddenForm"
						formaction="?/consume"
						value="Consume"
						class="btn btn-primary"
					/>
				</form>
			</div>
		</div>
	</dialog>
{/snippet}

<div class="flex flex-col items-center space-y-8">
	{#if coffee}
		{@const doses = coffee.doses as Dose[]}
		{@const brews = coffee.brews as Brew[]}
		<CoffeeCard {coffee} {doses} {brews} />
		<span>This tube holds {dose.weight}g of coffee</span>
		{@render ConsumeButton()}
	{:else}
		<span>This tube is currently empty</span>
	{/if}
</div>
