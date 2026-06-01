<script lang="ts">
	import Plus from 'lucide-svelte/icons/plus';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import { getTubeName, formatDateTime } from '$lib/utils';
	import { clearTube, createTube, getFirstEmptyTubeId, getTubes } from '$lib/tubes.remote';
	import { getUndosedWeight } from '$lib/inventory.remote';
	import { doseCreationSchema } from '$lib/validation';
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
	const weightIssues = $derived(creationForm.fields.weight.issues());
	const canCreateTube = $derived(
		weightValue !== undefined &&
			weightIssues === undefined &&
			weightValue <= undosedWeight &&
			firstEmptyTubeId !== null
	);
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

	const validateCreationForm = () =>
		creationForm.validate({ preflightOnly: true, includeUntouched: true });

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
							<input {...creationForm.fields.weight.as('number')} />
							<span class="label">g</span>
						</label>
						<span class="text-sm {isOverUndosedWeight ? 'text-error' : 'text-base-content/60'}">
							{undosedWeight}g undosed
						</span>
					</div>
					{#each creationForm.fields.weight.issues() as issue}
						<span class="text-error text-sm">{issue.message}</span>
					{/each}
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
			<button
				disabled={!canCreateTube}
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
								<input {...clearTubeForm.fields.drawer.as('hidden', tube.drawer)} />
								<input {...clearTubeForm.fields.tubeNumber.as('hidden', tube.tubeNumber)} />
								<button class="btn btn-error">Delete</button>
							</form>
						</div>
					</div>
				</dialog>
			</li>
		{/each}
	{/if}
</ul>
