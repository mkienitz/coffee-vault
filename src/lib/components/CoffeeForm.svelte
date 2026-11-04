<script lang="ts">
	import { deleteCoffee, manageCoffee } from './CoffeeForm.remote';
	import { dev } from '$app/env';
	import { getCoffee } from '#lib/data.remote.js';
	import { countryValues, processValues } from '#lib/constants.js';
	import FormDebug from './FormDebug.svelte';
	import { coffeeManagementSchema } from '#lib/validation/index.js';
	import { getCountryFlagEmoji } from '#lib/utils.js';

	interface Props {
		mode: 'update' | 'create';
		coffeeId?: number;
	}

	const { mode, coffeeId = undefined }: Props = $props();

	const countryNames = countryValues.map((c) => {
		return { value: c, label: c };
	});

	const processColorMap: Record<string, string> = {
		washed: 'checked:btn-info',
		honey: 'checked:btn-accent',
		natural: 'checked:btn-primary',
		advanced: 'checked:btn-secondary'
	};

	const manageForm = $derived(coffeeId !== undefined ? manageCoffee.for(coffeeId) : manageCoffee);
	const deleteForm = $derived(coffeeId !== undefined ? deleteCoffee.for(coffeeId) : undefined);
	const coffee = $derived(coffeeId !== undefined ? await getCoffee(coffeeId) : undefined);
	const pending = $derived(manageForm.pending > 0 || (deleteForm?.pending ?? 0) > 0);

	let deleteDialog: HTMLDialogElement | undefined = $state(undefined);
</script>

{#if dev}
	<FormDebug form={manageForm} />
{/if}

{#snippet Form()}
	{@const clientValidator = () => manageForm.validate({ preflightOnly: true, all: true })}
	<form
		{...manageForm.preflight(coffeeManagementSchema).enhance(async (form) => {
			const submitted = await form.submit();
			if (submitted && mode === 'create' && form.element.isConnected) {
				form.element.reset();
			}
		})}
		onfocusout={clientValidator}
		oninput={clientValidator}
		class="space-y-4"
	>
		{#each manageForm.fields.allIssues() as issue}
			<p class="text-error text-sm" role="alert">{issue.message}</p>
		{/each}
		<div class="form-control">
			<span class="label-text mb-1">Name</span>
			<input
				{...manageForm.fields.name.as('text', coffee?.name)}
				placeholder="Coffee Name"
				required
				class="input w-full"
			/>
			{#each manageForm.fields.name.issues() as issue (issue.message)}
				<span class="text-error text-sm">{issue.message}</span>
			{/each}
		</div>
		<div class="form-control">
			<span class="label-text mb-1">Roaster</span>
			<input
				{...manageForm.fields.roaster.as('text', coffee?.roaster)}
				placeholder="Roaster"
				class="input w-full"
			/>
			{#each manageForm.fields.roaster.issues() as issue (issue.message)}
				<span class="text-error text-sm">{issue.message}</span>
			{/each}
		</div>
		<div class="form-control">
			<span class="label-text mb-1">Varietals</span>
			<input
				{...manageForm.fields.varietals.as('text', coffee?.varietals)}
				placeholder="Varietals"
				class="input w-full"
			/>
		</div>
		<fieldset class="space-y-2">
			<legend class="mb-2 text-base font-semibold">Process</legend>
			<div class="form-control">
				<span class="label-text mb-1">Category</span>
				<div class="join w-full">
					{#each processValues as process}
						<input
							{...manageForm.fields.process.as('radio', process, coffee?.process === process)}
							class={['join-item btn btn-sm flex-1', processColorMap[process]]}
							aria-label={process}
						/>
					{/each}
				</div>
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Details</span>
				<input
					{...manageForm.fields.processDetails.as('text', coffee?.processDetails)}
					placeholder="the process as stated on the bag"
					aria-label="Process Details"
					class="input w-full"
				/>
			</div>
		</fieldset>
		<fieldset class="space-y-2">
			<legend class="mb-2 text-base font-semibold">Origin</legend>
			<div class="form-control">
				<span class="label-text mb-1">Country</span>
				<select {...manageForm.fields.country.as('select', coffee?.country)} class="select w-full">
					<option value={undefined} disabled>Select a country</option>
					{#each countryNames as countryName}
						<option value={countryName.value}>
							{countryName.value}
							{getCountryFlagEmoji(countryName.value)}
						</option>
					{/each}
				</select>
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Region</span>
				<input
					{...manageForm.fields.region.as('text', coffee?.region)}
					placeholder="Where in the country was the coffee grown?"
					class="input w-full"
				/>
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Farm</span>
				<input
					{...manageForm.fields.farm.as('text', coffee?.farm)}
					placeholder="What's the name of the farm or station?"
					class="input w-full"
				/>
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Producer</span>
				<input
					{...manageForm.fields.producer.as('text', coffee?.producer)}
					placeholder="Who produced the coffee?"
					class="input w-full"
				/>
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Elevation</span>
				<input
					{...manageForm.fields.elevation.as('text', coffee?.elevation)}
					placeholder="e.g. 1800m"
					class="input w-full"
				/>
			</div>
		</fieldset>
		<fieldset class="space-y-2">
			<legend class="mb-2 text-base font-semibold">Other</legend>
			<div class="form-control">
				<span class="label-text mb-1">Weight</span>
				<input
					{...manageForm.fields.weight.as('number', coffee?.weight)}
					required
					min="1"
					step="any"
					class="input w-full"
				/>
				{#each manageForm.fields.weight.issues() as issue (issue.message)}
					<span class="text-error text-sm">{issue.message}</span>
				{/each}
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Roasting Date</span>
				<input
					{...manageForm.fields.roastingDate.as('date', coffee?.roastingDate)}
					class="input w-full"
				/>
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Tasting Notes</span>
				<input
					{...manageForm.fields.flavorProfile.as('text', coffee?.flavorProfile)}
					placeholder="Add some tasting notes"
					class="input w-full"
				/>
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Description</span>
				<textarea
					{...manageForm.fields.description.as('text', coffee?.description)}
					class="textarea w-full"></textarea>
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Notes</span>
				<textarea {...manageForm.fields.notes.as('text', coffee?.notes)} class="textarea w-full"
				></textarea>
			</div>
		</fieldset>
		<div class="card-actions justify-end">
			{#if mode === 'create'}
				<button
					{...manageForm.fields.mode.as('submit', 'create')}
					disabled={pending}
					class="btn btn-success">Add Coffee</button
				>
			{:else}
				<button
					{...manageForm.fields.mode.as('submit', 'update')}
					disabled={pending}
					class="btn btn-primary"
					>Update Coffee
					{#if manageForm.pending > 0}
						⏳
					{/if}
				</button>
				<button
					type="button"
					disabled={pending}
					class="btn btn-error"
					onclick={() => deleteDialog?.showModal()}>Delete</button
				>
			{/if}
		</div>
	</form>
	{#if deleteForm}
		<dialog bind:this={deleteDialog} class="modal">
			<div class="modal-box">
				<h3>Are you sure?</h3>
				<p class="py-4">This will delete the coffee permanently!</p>
				{#each deleteForm.fields.allIssues() as issue}
					<p class="text-error text-sm" role="alert">{issue.message}</p>
				{/each}
				<div class="modal-action">
					<form method="dialog">
						<button class="btn" disabled={pending}>Cancel</button>
					</form>
					<form {...deleteForm}>
						<button disabled={pending} class="btn btn-error">Delete</button>
					</form>
				</div>
			</div>
		</dialog>
	{/if}
{/snippet}

<div class="card w-full max-w-2xl shadow-xl">
	<div class="card-body">
		<h2 class="text-center text-xl font-bold">
			{mode === 'create' ? 'Add a new Coffee' : 'Edit existing Coffee'}
		</h2>
		{@render Form()}
	</div>
</div>
