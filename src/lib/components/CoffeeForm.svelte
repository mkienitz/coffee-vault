<script lang="ts">
	import { getCountryCode, getEmojiFlag, type TCountryCode } from 'countries-list';
	import { manageCoffee } from './CoffeeForm.remote';
	import { getCoffee } from '$lib/data.remote';
	import { countryValues, processValues } from '$lib/constants';
	import FormDebug from './FormDebug.svelte';
	import { coffeeManagementSchema } from '$lib/validation';

	interface Props {
		mode: 'update' | 'create';
		coffeeId?: number;
	}

	const { mode, coffeeId = undefined }: Props = $props();

	const countryNames = countryValues.map((c) => {
		return { value: c, label: c };
	});

	const processColorMap: Record<string, string> = {
		washed: 'checked:btn-success',
		honey: 'checked:btn-warning',
		natural: 'checked:btn-error',
		advanced: 'checked:btn-primary'
	};

	const manageFormPromise = $derived.by(async () => {
		const manageForm = manageCoffee.for(coffeeId ?? -1);
		if (coffeeId) {
			const coffee = await getCoffee(coffeeId);
			manageForm.fields.set(coffee);
		}
		return manageForm;
	});

	let cId = $props.id();

	let deleteDialog: HTMLDialogElement | undefined = $state(undefined);
</script>

{#snippet Form()}
	{@const manageForm = await manageFormPromise}
	{@const clientValidator = () =>
		manageForm.validate({ preflightOnly: true, includeUntouched: true })}
	<form
		{...manageForm.preflight(coffeeManagementSchema).enhance(async ({ submit }) => await submit())}
		id={`${cId}-manageForm`}
		onfocusout={clientValidator}
		oninput={clientValidator}
		class="space-y-4"
	>
		<input {...manageForm.fields.id.as('number')} hidden />
		<div class="form-control">
			<span class="label-text mb-1">Name</span>
			<input
				{...manageForm.fields.name.as('text')}
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
			<input {...manageForm.fields.roaster.as('text')} placeholder="Roaster" class="input w-full" />
			{#each manageForm.fields.roaster.issues() as issue (issue.message)}
				<span class="text-error text-sm">{issue.message}</span>
			{/each}
		</div>
		<div class="form-control">
			<span class="label-text mb-1">Varietals</span>
			<input
				{...manageForm.fields.varietals.as('text')}
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
							{...manageForm.fields.process.as('radio', process)}
							class={['join-item btn btn-sm flex-1', processColorMap[process]]}
							aria-label={process}
						/>
					{/each}
				</div>
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Details</span>
				<input
					{...manageForm.fields.processDetails.as('text')}
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
				<select {...manageForm.fields.country.as('select')} class="select w-full">
					<option
						value={undefined}
						disabled
						selected={manageForm.fields.country.value() === undefined}>Select a country</option
					>
					{#each countryNames as countryName}
						<option value={countryName.value}>
							{countryName.value}
							{getEmojiFlag(getCountryCode(countryName.value) as TCountryCode)}
						</option>
					{/each}
				</select>
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Region</span>
				<input
					{...manageForm.fields.region.as('text')}
					placeholder="Where in the country was the coffee grown?"
					class="input w-full"
				/>
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Farm</span>
				<input
					{...manageForm.fields.farm.as('text')}
					placeholder="What's the name of the farm or station?"
					class="input w-full"
				/>
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Producer</span>
				<input
					{...manageForm.fields.producer.as('text')}
					placeholder="Who produced the coffee?"
					class="input w-full"
				/>
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Elevation</span>
				<input
					{...manageForm.fields.elevation.as('text')}
					placeholder="e.g. 1800m"
					class="input w-full"
				/>
			</div>
		</fieldset>
		<fieldset class="space-y-2">
			<legend class="mb-2 text-base font-semibold">Other</legend>
			<div class="form-control">
				<span class="label-text mb-1">Weight</span>
				<input {...manageForm.fields.weight.as('number')} required class="input w-full" />
				{#each manageForm.fields.weight.issues() as issue (issue.message)}
					<span class="text-error text-sm">{issue.message}</span>
				{/each}
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Roasting Date</span>
				<input {...manageForm.fields.roastingDate.as('date')} class="input w-full" />
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Tasting Notes</span>
				<input
					{...manageForm.fields.flavorProfile.as('text')}
					placeholder="Add some tasting notes"
					class="input w-full"
				/>
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Description</span>
				<textarea {...manageForm.fields.description.as('text')} class="textarea w-full"></textarea>
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Notes</span>
				<textarea {...manageForm.fields.notes.as('text')} class="textarea w-full"></textarea>
			</div>
		</fieldset>
		<div class="card-actions justify-end">
			{#if mode === 'create'}
				<button {...manageForm.fields.mode.as('submit', 'create')} class="btn btn-success"
					>Add Coffee</button
				>
			{:else}
				<button {...manageForm.fields.mode.as('submit', 'update')} class="btn btn-primary"
					>Update Coffee
					{#if manageForm.pending > 0}
						⏳
					{/if}
				</button>
				<button
					class="btn btn-error"
					onclick={(e) => {
						e.preventDefault();
						deleteDialog!.showModal();
					}}>Delete</button
				>
			{/if}
		</div>
	</form>
	<dialog bind:this={deleteDialog} class="modal">
		<div class="modal-box">
			<h3>Are you sure?</h3>
			<p class="py-4">This will delete the coffee permanently!</p>
			<div class="modal-action">
				<form method="dialog">
					<button class="btn">Cancel</button>
					<button
						form={`${cId}-manageForm`}
						{...manageForm.fields.mode.as('submit', 'delete')}
						class="btn btn-error">Delete</button
					>
				</form>
			</div>
		</div>
	</dialog>
{/snippet}

<div class="card w-full max-w-2xl shadow-xl">
	<div class="card-body">
		<h2 class="text-center text-xl font-bold">
			{mode === 'create' ? 'Add a new Coffee' : 'Edit existing Coffee'}
		</h2>
		{@render Form()}
	</div>
</div>
<FormDebug form={await manageFormPromise} />
