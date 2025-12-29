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
	import { type Dose } from '$lib/types';

	interface Props {
		coffeeId: number;
	}

	const { coffeeId }: Props = $props();

	const leftToDose = $derived(getCoffeeLeftToDose(coffeeId));
	const nextFreeDose = $derived(getFreeDoseId());
	// const testDerived = $derived(leftToDose.then((a) => `YOOO: ${a}`));
	// const clientSchema = $derived(leftToDose.then((w) => getDoseCreationSchema(w)));
	// $inspect(clientSchema)

	let deleteDialogs: Record<string, HTMLDialogElement> = $state({});
</script>

<!-- {await testDerived} -->
{#snippet CreationListElement()}
	<form
		class="contents"
		{...createDose.preflight(doseCreationSchema).enhance(async ({ submit }) => {
			await submit();
		})}
		oninput={() => createDose.validate({ preflightOnly: true })}
	>
		<!-- NOTE: non-string hidden type not yet supported -->
		<input {...createDose.fields.coffeeId.as('number')} hidden value={coffeeId} />
		{#if await nextFreeDose}
			<div
				class="bg-base-200 text-base-content/30 flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-mono text-lg font-bold"
			>
				{await nextFreeDose}
			</div>
			<div>
				<div class="flex items-center gap-2">
					<label class="input has-[input[aria-invalid=true]]:input-error w-fit">
						<input {...createDose.fields.weight.as('number')} />
						<!-- required -->
						<!-- min="1" -->
						<!-- max="20" -->
						<!-- placeholder="12.5" -->
						<!-- step="0.5" -->
						<span class="label">g</span>
					</label>
					<span
						class="text-sm {createDose.fields.weight.value() > (await leftToDose)
							? 'text-error'
							: 'text-base-content/60'}"
					>
						{await leftToDose}g left
					</span>
				</div>
				{#each createDose.fields.weight.issues() as issue}
					<span class="text-error text-sm">{issue.message}</span>
				{/each}
			</div>
		{:else}
			<div
				class="bg-error text-error-content/30 flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-mono text-lg font-bold"
			>
				--
			</div>
			<div>
				<span class="text-error text-sm">No empty tubes available</span>
			</div>
		{/if}
		<button
			disabled={!(await nextFreeDose) || createDose.fields.weight.value() > (await leftToDose)}
			class="btn btn-circle btn-ghost btn-sm enabled:text-success"
		>
			<Plus />
		</button>
	</form>
{/snippet}

{#snippet ManagementListElement(dose: Dose)}
	{@const tubeName = getTubeName(dose)}
	{@const clearDoseForm = clearDose.for(tubeName)}
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
{/snippet}

<ul class="list bg-base-100 rounded-box shadow-sm">
	<li class="list-row items-center">
		{@render CreationListElement()}
	</li>
	{#if (await getDoses(coffeeId)).length === 0}
		<li class="p-12 text-center">
			<p class="text-base-content/60">No doses yet</p>
		</li>
	{:else}
		{#each await getDoses(coffeeId) as dose (dose.drawer + dose.tubeNumber)}
			{@render ManagementListElement(dose)}
		{/each}
	{/if}
</ul>
