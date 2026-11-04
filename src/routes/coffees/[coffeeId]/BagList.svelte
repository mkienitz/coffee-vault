<script lang="ts">
	import Printer from 'lucide-svelte/icons/printer';
	import Plus from 'lucide-svelte/icons/plus';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import { createBag, deleteBag, getBags, printBag } from '#lib/bags.remote.js';
	import { getUndosedWeight } from '#lib/inventory.remote.js';
	import { formatDateTime } from '#lib/utils.js';
	import { bagCreationSchema } from '#lib/validation/index.js';
	import * as v from 'valibot';

	interface Props {
		coffeeId: number;
	}

	let { coffeeId }: Props = $props();
	const bagDataPromise = $derived(Promise.all([getBags(coffeeId), getUndosedWeight(coffeeId)]));
	const [bags, undosedWeight] = $derived(await bagDataPromise);
	const creationForm = $derived(createBag.for(coffeeId));

	let deleteDialogs: Record<string, HTMLDialogElement> = $state({});

	const clientSideCreationSchema = $derived(
		v.object({
			...bagCreationSchema.entries,
			weight: v.pipe(
				bagCreationSchema.entries.weight,
				v.maxValue(undosedWeight, `Weight must be <= ${undosedWeight}g`)
			)
		})
	);

	const validateCreationForm = () => creationForm.validate({ preflightOnly: true, all: true });
</script>

<div class="space-y-3">
	<form
		{...creationForm.preflight(clientSideCreationSchema)}
		oninput={validateCreationForm}
		class="border-base-300 bg-base-200/40 rounded-box space-y-3 border p-4"
	>
		<input {...creationForm.fields.coffeeId.as('hidden', coffeeId)} />
		<div class="flex flex-wrap items-end gap-3">
			<label class="min-w-0 flex-1 space-y-1.5 sm:flex-none">
				<span class="block text-sm font-medium">Bag weight</span>
				<span class="input has-[input[aria-invalid=true]]:input-error w-full sm:w-36">
					<input
						{...creationForm.fields.weight.as('number')}
						aria-label="Bag weight"
						required
						min="1"
						max={undosedWeight}
						step="any"
						disabled={undosedWeight < 1}
					/>
					<span class="label">g</span>
				</span>
			</label>
			<button
				disabled={creationForm.pending > 0 || undosedWeight < 1}
				aria-label="Create bag"
				class="btn btn-primary"><Plus size={16} /> Add bag</button
			>
		</div>
		<p class="text-base-content/60 text-xs leading-relaxed">
			{#if undosedWeight < 1}No undosed coffee left.{:else}{undosedWeight} g available to portion{/if}
		</p>
		{#each creationForm.fields.allIssues() as issue}
			<p class="text-error text-sm" role="alert">{issue.message}</p>
		{/each}
	</form>
	<ul class="list">
		{#if bags.length === 0}
			<li class="border-base-300 rounded-box border border-dashed px-4 py-8 text-center">
				<p class="text-base-content/60 text-sm">No bags yet. Add a portion above.</p>
			</li>
		{:else}
			{#each bags as bag (bag.id)}
				{@const deleteForm = deleteBag.for(bag.id)}
				{@const printForm = printBag.for(bag.id)}
				<li class="list-row items-center gap-2! px-1!">
					<div class="list-col-grow min-w-0 space-y-1">
						<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
							<span class="text-sm font-medium tabular-nums">{bag.weight} g</span>
							<span class="text-base-content/50 font-mono text-xs" title={bag.id}
								>{bag.id.slice(0, 8)}</span
							>
						</div>
						<div class="text-base-content/60 text-xs">
							{formatDateTime(bag.creationDate)}
						</div>
					</div>
					<form {...printForm}>
						{#each printForm.fields.allIssues() as issue}
							<p class="text-error text-sm" role="alert">{issue.message}</p>
						{/each}
						<button
							class="btn btn-square btn-ghost btn-sm text-base-content/60"
							title="Print bag label"
							disabled={printForm.pending > 0 || deleteForm.pending > 0}
						>
							<Printer size={16} />
						</button>
					</form>
					<button
						class="btn btn-square btn-ghost btn-sm text-base-content/50 hover:text-error"
						aria-label="Delete bag"
						disabled={deleteForm.pending > 0 || printForm.pending > 0}
						onclick={() => deleteDialogs[bag.id]?.showModal()}
					>
						<Trash2 size={16} />
					</button>
					<dialog bind:this={deleteDialogs[bag.id]} class="modal">
						<div class="modal-box text-left">
							<h3 class="text-lg font-semibold">Delete this bag?</h3>
							<p class="py-4">This will delete the bag permanently.</p>
							<div class="modal-action justify-end">
								<form method="dialog">
									<button class="btn">Cancel</button>
								</form>
								<form {...deleteForm}>
									{#each deleteForm.fields.allIssues() as issue}
										<p class="text-error text-sm" role="alert">{issue.message}</p>
									{/each}
									<button
										disabled={deleteForm.pending > 0 || printForm.pending > 0}
										class="btn btn-error">Delete</button
									>
								</form>
							</div>
						</div>
					</dialog>
				</li>
			{/each}
		{/if}
	</ul>
</div>
