<script lang="ts">
	import Plus from 'lucide-svelte/icons/plus';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import { getTubeName, formatDateTime } from '$lib/utils';
	import {
		clearDose,
		getCoffeeLeftToDose,
		createDose,
		getDoses,
		getFreeDoseId
	} from './data.remote';
	import { doseCreationSchema } from '$lib/validation';

	interface Props {
		coffeeId: number;
	}

	let { coffeeId }: Props = $props();

	const doses = $derived(getDoses(coffeeId));
	const creationForm = $derived(createDose.for(coffeeId));

	let deleteDialogs: Record<string, HTMLDialogElement> = $state({});
</script>

<ul class="list bg-base-100 rounded-box shadow-sm">
	<li class="list-row items-center">
		<form
			class="contents"
			{...creationForm.preflight(doseCreationSchema).enhance(async ({ submit }) => {
				await submit();
			})}
			oninput={() => creationForm.validate({ preflightOnly: true })}
		>
			<input {...creationForm.fields.coffeeId.as('number')} hidden value={coffeeId} />
			{#if await getFreeDoseId()}
				<div
					class="bg-base-200 text-base-content/30 flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-mono text-lg font-bold"
				>
					{await getFreeDoseId()}
				</div>
				<div>
					<div class="flex items-center gap-2">
						<label class="input has-[input[aria-invalid=true]]:input-error w-fit">
							<input {...creationForm.fields.weight.as('number')} />
							<span class="label">g</span>
						</label>
						<span
							class="text-sm {creationForm.fields.weight.value() >
							(await getCoffeeLeftToDose(coffeeId))
								? 'text-error'
								: 'text-base-content/60'}"
						>
							{await getCoffeeLeftToDose(coffeeId)}g left
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
				disabled={creationForm.fields.weight.value() > (await getCoffeeLeftToDose(coffeeId)) ||
					(await getFreeDoseId()) === null}
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
		{#each await doses as dose (dose.drawer + dose.tubeNumber)}
			{@const tubeName = getTubeName(dose)}
			{@const clearDoseForm = clearDose.for(`${dose.drawer}${dose.tubeNumber}`)}
			<li class="list-row items-center">
				<a href="/doses/{tubeName}" class="shrink-0">
					<div
						class="bg-base-200 flex h-12 w-12 items-center justify-center rounded-full font-mono text-lg font-bold"
					>
						{tubeName}
					</div>
				</a>
				<div>
					<div class="text-sm font-medium">{dose.weight}g</div>
					<div class="text-base-content/60 text-xs">{formatDateTime(dose.creationDate)}</div>
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
						<p class="py-4">This will delete the dose permanently!</p>
						<div class="modal-action justify-end">
							<form hidden id="clearDoseForm-{tubeName}" {...clearDoseForm}>
								<input {...clearDoseForm.fields.drawer.as('hidden', dose.drawer)} />
								<input {...clearDoseForm.fields.tubeNumber.as('hidden', dose.tubeNumber)} />
							</form>
							<form method="dialog">
								<button class="btn">Cancel</button>
								<input
									type="submit"
									form="clearDoseForm-{tubeName}"
									value="Delete"
									class="btn btn-error"
								/>
							</form>
						</div>
					</div>
				</dialog>
			</li>
		{/each}
	{/if}
</ul>
