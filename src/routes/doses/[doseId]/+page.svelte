<script lang="ts">
	import CoffeeCard from '$lib/components/CoffeeCard.svelte';
	import { getDose } from '$lib/data.remote';
	// TODO: Fix after refactoring remote functions
	import { consumeDose } from '../../coffees/[coffeeId]/data.remote';
	import type { PageProps } from './$types';

	const { params }: PageProps = $props();

	let consumeDialog: HTMLDialogElement | undefined = $state(undefined);
	const dose = $derived(await getDose(params.doseId));
</script>

{#snippet ConsumeButton()}
	{@const formId = `consumeDoseForm-${dose.drawer}${dose.tubeNumber}`}
	<button class="btn btn-primary" onclick={() => consumeDialog!.showModal()}
		>Mark as Consumed</button
	>
	<dialog bind:this={consumeDialog} class="modal">
		<div class="modal-box">
			<h3>Are you sure?</h3>
			<p class="py-4">Marking the coffee as consumed cannot be undone!</p>
			<div class="modal-action">
				<form
					{...consumeDose.enhance(async ({ submit }) => {
						await submit();
					})}
					hidden
					id={formId}
				>
					<input {...consumeDose.fields.drawer.as('hidden', dose.drawer)} />
					<input {...consumeDose.fields.tubeNumber.as('hidden', dose.tubeNumber)} />
				</form>
				<form method="dialog">
					<button class="btn">Cancel</button>
					<input type="submit" form={formId} value="Consume" class="btn btn-primary" />
				</form>
			</div>
		</div>
	</dialog>
{/snippet}

<div class="flex flex-col items-center space-y-8">
	{#if dose.coffeeId}
		<CoffeeCard coffeeId={dose.coffeeId} />
		<span>This tube holds {dose.weight!}g of coffee</span>
		{@render ConsumeButton()}
	{:else}
		<span>This tube is currently empty</span>
	{/if}
</div>
