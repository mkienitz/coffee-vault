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
	const weightValue = $derived(creationForm.fields.weight.value());
	const isOverUndosedWeight = $derived(weightValue !== undefined && weightValue > undosedWeight);
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

<ul class="list bg-base-100 rounded-box shadow-sm">
	<li class="list-row items-center">
		<form
			class="contents"
			{...creationForm.preflight(clientSideCreationSchema)}
			oninput={validateCreationForm}
		>
			<input {...creationForm.fields.coffeeId.as('hidden', coffeeId)} />
			{#if firstEmptyTubeId}
				<div
					class="bg-base-200 text-base-content/30 flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-mono text-lg font-bold"
				>
					{firstEmptyTubeId}
				</div>
				<div>
					<div class="flex items-center gap-2">
						<label class="input has-[input[aria-invalid=true]]:input-error w-fit">
							<input
								{...creationForm.fields.weight.as('number')}
								aria-label="Tube weight"
								required
								min="1"
								max={Math.min(20, undosedWeight)}
								step="any"
							/>
							<span class="label">g</span>
						</label>
						<span class="text-sm {isOverUndosedWeight ? 'text-error' : 'text-base-content/60'}">
							{undosedWeight}g undosed
						</span>
					</div>
				</div>
			{:else}
				<div
					class="bg-error/30 text-error-content/60 flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-mono text-lg font-bold"
				>
					--
				</div>
				<div>
					<span class="text-error text-sm">No empty tubes available</span>
				</div>
			{/if}
			{#each creationForm.fields.allIssues() as issue}
				<p class="text-error text-sm" role="alert">{issue.message}</p>
			{/each}
			<button
				aria-label="Create tube"
				disabled={creationForm.pending > 0 || undosedWeight < 1 || firstEmptyTubeId === null}
				class="btn btn-circle btn-ghost btn-sm enabled:text-success"
			>
				<Plus />
			</button>
		</form>
	</li>
	{#if tubes.length === 0}
		<li class="p-12 text-center">
			<p class="text-base-content/60">No tubes yet</p>
		</li>
	{:else}
		{#each tubes as tube (tube.drawer + tube.tubeNumber)}
			{@const tubeName = getTubeName(tube)}
			{@const clearTubeForm = clearTube.for(tubeName)}
			<li class="list-row items-center">
				<a href="/doses/{tubeName}" class="shrink-0">
					<div
						class="bg-base-200 flex h-12 w-12 items-center justify-center rounded-full font-mono text-lg font-bold"
					>
						{tubeName}
					</div>
				</a>
				<div>
					<div class="text-sm font-medium">{tube.weight}g</div>
					<div class="text-base-content/60 text-xs">{formatDateTime(tube.creationDate)}</div>
				</div>
				<button
					class="btn btn-circle btn-ghost text-error btn-sm"
					aria-label="Clear tube"
					disabled={clearTubeForm.pending > 0}
					onclick={() => deleteDialogs[tubeName]?.showModal()}
				>
					<Trash2 />
				</button>
				<dialog bind:this={deleteDialogs[tubeName]} class="modal">
					<div class="modal-box text-left">
						<h3>Are you sure?</h3>
						<p class="py-4">This will clear the tube.</p>
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
								<button disabled={clearTubeForm.pending > 0} class="btn btn-error">Delete</button>
							</form>
						</div>
					</div>
				</dialog>
			</li>
		{/each}
	{/if}
</ul>
