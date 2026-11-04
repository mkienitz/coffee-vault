<script lang="ts">
	import Plus from 'lucide-svelte/icons/plus';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import { getTubeName, formatDateTime } from '#lib/utils.js';
	import { clearTube, createTube, getFirstEmptyTubeId, getTubes } from '#lib/tubes.remote.js';
	import { getUndosedWeight } from '#lib/inventory.remote.js';
	import { doseCreationSchema } from '#lib/validation/index.js';
	import * as v from 'valibot';

	interface Props {
		coffeeId: number;
	}

	let { coffeeId }: Props = $props();

	const tubeDataPromise = $derived(
		Promise.all([getTubes(coffeeId), getFirstEmptyTubeId(), getUndosedWeight(coffeeId)])
	);
	const [tubes, firstEmptyTubeId, undosedWeight] = $derived(await tubeDataPromise);
	const creationForm = $derived(createTube.for(coffeeId));
	const clientSideCreationSchema = $derived(
		v.object({
			...doseCreationSchema.entries,
			weight: v.pipe(
				doseCreationSchema.entries.weight,
				v.maxValue(undosedWeight, `Weight must be <= ${undosedWeight}g`)
			)
		})
	);

	const validateCreationForm = () => creationForm.validate({ preflightOnly: true, all: true });

	let deleteDialogs: Record<string, HTMLDialogElement> = $state({});
</script>

<div class="space-y-3">
	<form
		class="border-base-300 bg-base-200/40 rounded-box space-y-3 border p-4"
		{...creationForm.preflight(clientSideCreationSchema).enhance(async (form) => {
			// Keep the weight for filling more tubes with the same dose.
			await form.submit();
		})}
		oninput={validateCreationForm}
	>
		<input {...creationForm.fields.coffeeId.as('hidden', coffeeId)} />
		<div class="flex flex-wrap items-end gap-3">
			<label class="min-w-0 flex-1 space-y-1.5 sm:flex-none">
				<span class="block text-sm font-medium">Dose weight</span>
				<span class="input has-[input[aria-invalid=true]]:input-error w-full sm:w-36">
					<input
						{...creationForm.fields.weight.as('number')}
						aria-label="Tube weight"
						required
						min="1"
						max={Math.min(20, undosedWeight)}
						step="any"
						disabled={firstEmptyTubeId === null || undosedWeight < 1}
					/>
					<span class="label">g</span>
				</span>
			</label>
			<button
				aria-label="Create tube"
				disabled={creationForm.pending > 0 || undosedWeight < 1 || firstEmptyTubeId === null}
				class="btn btn-primary"><Plus size={16} /> Add dose</button
			>
		</div>
		<p class="text-base-content/60 text-xs leading-relaxed">
			{#if firstEmptyTubeId === null}
				All tubes are filled. Clear a tube to add another dose.
			{:else if undosedWeight < 1}
				No undosed coffee left.
			{:else}
				Next tube: <span class="text-base-content font-mono font-medium">{firstEmptyTubeId}</span>
				<span class="mx-1" aria-hidden="true">·</span>
				Up to {Math.min(20, undosedWeight)} g per dose
			{/if}
		</p>
		{#each creationForm.fields.allIssues() as issue}
			<p class="text-error text-sm" role="alert">{issue.message}</p>
		{/each}
	</form>
	<ul class="list">
		{#if tubes.length === 0}
			<li class="border-base-300 rounded-box border border-dashed px-4 py-8 text-center">
				<p class="text-base-content/60 text-sm">No tubes yet. Add your first dose above.</p>
			</li>
		{:else}
			{#each tubes as tube (tube.drawer + tube.tubeNumber)}
				{@const tubeName = getTubeName(tube)}
				{@const clearTubeForm = clearTube.for(tubeName)}
				<li class="list-row items-center gap-3! px-1!">
					<a
						href="/doses/{tubeName}"
						class="btn btn-soft btn-circle size-12 shrink-0 font-mono"
						aria-label="Open tube {tubeName}">{tubeName}</a
					>
					<div class="list-col-grow min-w-0 space-y-1">
						<div class="text-sm font-medium tabular-nums">{tube.weight} g</div>
						<div class="text-base-content/60 text-xs">{formatDateTime(tube.creationDate)}</div>
					</div>
					<button
						class="btn btn-square btn-ghost btn-sm text-base-content/50 hover:text-error"
						aria-label="Clear tube"
						disabled={clearTubeForm.pending > 0}
						onclick={() => deleteDialogs[tubeName]?.showModal()}
					>
						<Trash2 size={16} />
					</button>
					<dialog bind:this={deleteDialogs[tubeName]} class="modal">
						<div class="modal-box text-left">
							<h3 class="text-lg font-semibold">Clear tube {tubeName}?</h3>
							<p class="py-4">The coffee will become available to portion again.</p>
							<div class="modal-action justify-end">
								<form method="dialog">
									<button class="btn">Cancel</button>
								</form>
								<form {...clearTubeForm}>
									{#each clearTubeForm.fields.allIssues() as issue}
										<p class="text-error text-sm" role="alert">{issue.message}</p>
									{/each}
									<input {...clearTubeForm.fields.drawer.as('hidden', tube.drawer)} />
									<input {...clearTubeForm.fields.tubeNumber.as('hidden', tube.tubeNumber)} />
									<button disabled={clearTubeForm.pending > 0} class="btn btn-error"
										>Clear tube</button
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
