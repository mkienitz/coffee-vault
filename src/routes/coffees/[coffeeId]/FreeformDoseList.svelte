<script lang="ts">
	import Plus from 'lucide-svelte/icons/plus';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import {
		getCoffeeLeftToDose,
		createFreeFormDose,
		deleteFreeFormDose,
		getFreeFormDoses
	} from './data.remote';
	import { formatDateTime } from '$lib/utils';
	import { freeFormDoseCreationSchema } from '$lib/validation';
	import * as v from 'valibot';

	interface Props {
		coffeeId: number;
	}

	let { coffeeId }: Props = $props();
	const doses = $derived(getFreeFormDoses(coffeeId));
	const creationForm = $derived(createFreeFormDose.for(coffeeId));
	const coffeeLeftToDosePromise = $derived(getCoffeeLeftToDose(coffeeId));

	let deleteDialogs: Record<string, HTMLDialogElement> = $state({});
	const coffeeLeftToDose = $derived(await coffeeLeftToDosePromise);

	const clientSideCreationSchema = $derived(
		v.object({
			...freeFormDoseCreationSchema.entries,
			weight: v.pipe(
				freeFormDoseCreationSchema.entries.weight,
				v.maxValue(coffeeLeftToDose, `Weight must be <= ${coffeeLeftToDose}g`)
			)
		})
	);
	$inspect('schema', clientSideCreationSchema, 'left', coffeeLeftToDose);
</script>

<ul class="list bg-base-100 rounded-box shadow-sm">
	<li class="list-row items-center">
		<form
			{...creationForm.preflight(clientSideCreationSchema).enhance(async ({ submit }) => {
				await submit();
			})}
			oninput={() => creationForm.validate({ preflightOnly: true })}
			class="contents"
		>
			<div class="list-col-grow flex items-center gap-2">
				<input hidden {...creationForm.fields.coffeeId.as('number')} value={coffeeId} />
				<label class="input has-[input[aria-invalid=true]]:input-error w-fit">
					<input {...creationForm.fields.weight.as('number')} />
					<span class="label">g</span>
				</label>
				{#each creationForm.fields.weight.issues() as issue}
					<span class="text-error text-sm">{issue.message}</span>
				{:else}
					<span class="text-base-content/60 text-sm">{coffeeLeftToDose}g left</span>
				{/each}
			</div>
			<button
				disabled={!creationForm.fields.weight.value() ||
					creationForm.fields.weight.issues() != undefined}
				class="btn btn-circle btn-ghost btn-sm enabled:text-success"
			>
				<Plus />
			</button>
		</form>
	</li>
	{#if (await doses).length === 0}
		<li class="p-12 text-center">
			<p class="text-base-content/60">No doses yet</p>
		</li>
	{:else}
		{#each await doses as dose (dose.id)}
			{@const deleteForm = deleteFreeFormDose.for(dose.id)}
			<li class="list-row items-center">
				<a href="/freeFormDoses/{dose.id}">
					<span class="font-mono">{dose.id.slice(0, 8)}…</span>
				</a>
				<div class="list-col-grow">
					<div class="text-sm font-medium">{dose.weight}g</div>
					<div class="text-base-content/60 text-xs whitespace-nowrap">
						{formatDateTime(dose.creationDate)}
					</div>
				</div>
				<button
					class="btn btn-circle btn-ghost text-error btn-sm"
					onclick={() => deleteDialogs[dose.id]?.showModal()}
				>
					<Trash2 />
				</button>
				<dialog bind:this={deleteDialogs[dose.id]} class="modal">
					<div class="modal-box text-left">
						<h3>Are you sure?</h3>
						<p class="py-4">This will delete the dose permanently!</p>
						<div class="modal-action justify-end">
							<form hidden id="freeFormDeletionForm-{dose.id}" {...deleteForm}>
								<input {...deleteForm.fields.id.as('hidden', dose.id)} />
							</form>
							<form method="dialog">
								<button class="btn">Cancel</button>
								<input
									type="submit"
									form="freeFormDeletionForm-{dose.id}"
									class="btn btn-error"
									value="Delete"
								/>
							</form>
						</div>
					</div>
				</dialog>
			</li>
		{/each}
	{/if}
</ul>
