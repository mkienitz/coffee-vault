<script lang="ts">
	import CoffeeCard from '$lib/components/CoffeeCard.svelte';
	import { getDose } from '$lib/data.remote';
	import { consumeTube } from '$lib/tubes.remote';
	import type { PageProps } from './$types';

	const { params }: PageProps = $props();

	let consumeDialog: HTMLDialogElement | undefined = $state(undefined);
	const dose = $derived(await getDose(params.doseId));
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
				<form method="dialog">
					<button class="btn">Cancel</button>
				</form>
				<form {...consumeTube}>
					<input {...consumeTube.fields.drawer.as('hidden', dose.drawer)} />
					<input {...consumeTube.fields.tubeNumber.as('hidden', dose.tubeNumber)} />
					<button class="btn btn-primary">Consume</button>
				</form>
			</div>
		</div>
	</dialog>
{/snippet}

<div class="flex flex-col items-center space-y-8">
	{#if dose.coffeeId}
		<CoffeeCard coffeeId={dose.coffeeId} overrideTube={params.doseId} />
		<span>This tube holds {dose.weight!}g of coffee</span>
		{@render ConsumeButton()}
	{:else}
		<span>This tube is currently empty</span>
	{/if}
</div>
