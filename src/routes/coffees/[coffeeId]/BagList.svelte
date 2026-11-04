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
	const weightValue = $derived(creationForm.fields.weight.value());
	const isOverUndosedWeight = $derived(weightValue !== undefined && weightValue > undosedWeight);

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

<ul class="list bg-base-100 rounded-box shadow-sm">
	<li class="list-row items-center">
		<form
			{...creationForm.preflight(clientSideCreationSchema)}
			oninput={validateCreationForm}
			class="contents"
		>
			<div class="list-col-grow flex items-center gap-2">
				<input {...creationForm.fields.coffeeId.as('hidden', coffeeId)} />
				<label class="input has-[input[aria-invalid=true]]:input-error w-fit">
					<input
						{...creationForm.fields.weight.as('number')}
						aria-label="Bag weight"
						required
						min="1"
						max={undosedWeight}
						step="any"
					/>
					<span class="label">g</span>
				</label>
				{#each creationForm.fields.allIssues() as issue}
					<span class="text-error text-sm" role="alert">{issue.message}</span>
				{:else}
					<span class="text-sm {isOverUndosedWeight ? 'text-error' : 'text-base-content/60'}">
						{undosedWeight}g undosed
					</span>
				{/each}
			</div>
			<button
				disabled={creationForm.pending > 0 || undosedWeight < 1}
				aria-label="Create bag"
				class="btn btn-circle btn-ghost btn-sm enabled:text-success"
			>
				<Plus />
			</button>
		</form>
	</li>
	{#if bags.length === 0}
		<li class="p-12 text-center">
			<p class="text-base-content/60">No bags yet</p>
		</li>
	{:else}
		{#each bags as bag (bag.id)}
			{@const deleteForm = deleteBag.for(bag.id)}
			{@const printForm = printBag.for(bag.id)}
			<li class="list-row items-center">
				<span class="font-mono">{bag.id.slice(0, 8)}…</span>
				<div class="list-col-grow">
					<div class="text-sm font-medium">{bag.weight}g</div>
					<div class="text-base-content/60 text-xs whitespace-nowrap">
						{formatDateTime(bag.creationDate)}
					</div>
				</div>
				<form {...printForm}>
					{#each printForm.fields.allIssues() as issue}
						<p class="text-error text-sm" role="alert">{issue.message}</p>
					{/each}
					<button
						class="btn btn-circle btn-ghost btn-sm"
						title="Print bag label"
						disabled={printForm.pending > 0 || deleteForm.pending > 0}
					>
						<Printer />
					</button>
				</form>
				<button
					class="btn btn-circle btn-ghost text-error btn-sm"
					aria-label="Delete bag"
					disabled={deleteForm.pending > 0 || printForm.pending > 0}
					onclick={() => deleteDialogs[bag.id]?.showModal()}
				>
					<Trash2 />
				</button>
				<dialog bind:this={deleteDialogs[bag.id]} class="modal">
					<div class="modal-box text-left">
						<h3>Are you sure?</h3>
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
