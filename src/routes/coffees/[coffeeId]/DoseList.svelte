<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Plus, Trash2 } from 'lucide-svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type {
		DoseCreationSchema,
		DoseManagementSchema,
		Dose,
		DoseIdentifier
	} from '$lib/zod-schemas';
	import { getTubeName } from '$lib/utils';

	interface Props {
		creationForm: SuperValidated<DoseCreationSchema>;
		managementForm: SuperValidated<DoseManagementSchema>;
		doses: Dose[];
		nextFreeDose: DoseIdentifier | null;
		leftToDose: number;
	}

	let {
		creationForm: creationFormData,
		managementForm: managementFormData,
		doses,
		nextFreeDose,
		leftToDose
	}: Props = $props();

	const { form: creationForm, enhance: creationEnhance } = superForm(creationFormData, {
		resetForm: false
	});
	const { enhance: managementEnhance, formId: managementId } = superForm(managementFormData, {
		resetForm: false
	});

	let deleteDialogs: Record<string, HTMLDialogElement> = $state({});
</script>

<ul class="list bg-base-100 rounded-box shadow-sm">
	<li class="list-row items-center">
		<form id="creationForm" method="POST" use:creationEnhance class="contents">
			{#if nextFreeDose}
				<div
					class="bg-base-200 text-base-content/30 flex h-12 w-12 items-center justify-center rounded-full font-mono text-lg font-bold"
				>
					{nextFreeDose.drawer}{nextFreeDose.tubeNumber}
				</div>
			{:else}
				<div
					class="bg-error text-error-content/30 flex h-12 w-12 items-center justify-center rounded-full font-mono text-lg font-bold"
				>
					--
				</div>
			{/if}
			{#if nextFreeDose}
				<div class="list-col-grow flex items-center gap-2">
					<label class="input input-bordered input-sm w-fit">
						<input
							name="weight"
							type="number"
							min="1"
							max="20"
							placeholder="12.5"
							step="0.5"
							bind:value={$creationForm.weight}
						/>
						<span class="label">g</span>
					</label>
					<span
						class="text-sm {$creationForm.weight > leftToDose
							? 'text-error'
							: 'text-base-content/60'}"
					>
						{leftToDose}g left
					</span>
				</div>
			{:else}
				<div class="list-col-grow">
					<span class="text-error text-sm">No empty tubes available</span>
				</div>
			{/if}
			<button
				type="submit"
				formaction="?/add"
				disabled={!nextFreeDose || $creationForm.weight > leftToDose}
				class="btn btn-circle btn-ghost btn-sm enabled:text-success"
			>
				<Plus />
			</button>
		</form>
	</li>
	{#if doses.length === 0}
		<li class="p-12 text-center">
			<p class="text-base-content/60">No doses yet</p>
		</li>
	{:else}
		{#each doses as dose (dose.drawer + dose.tubeNumber)}
			{@const tubeName = getTubeName(dose)}
			<li class="list-row items-center">
				<a href="/doses/{tubeName}">
					<div
						class="bg-base-200 flex h-12 w-12 items-center justify-center rounded-full font-mono text-lg font-bold"
					>
						{tubeName}
					</div>
				</a>
				<div class="list-col-grow">
					<div class="text-sm font-medium">{dose.weight}g</div>
					<div class="text-base-content/60 text-xs">{dose.creationDate}</div>
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
							<form hidden id="managementForm-{tubeName}" method="POST" use:managementEnhance>
								<input hidden name="drawer" value={dose.drawer} />
								<input hidden name="tubeNumber" value={dose.tubeNumber} />
							</form>
							<form method="dialog">
								<button class="btn">Cancel</button>
								<input
									type="submit"
									value="Delete"
									form="managementForm-{tubeName}"
									formaction="?/delete"
									onclick={() => {
										$managementId = tubeName;
									}}
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
