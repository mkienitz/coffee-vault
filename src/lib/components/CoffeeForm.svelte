<script lang="ts">
	import { getCountryCode, getEmojiFlag, countries, type TCountryCode } from 'countries-list';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { ChevronLeft } from 'lucide-svelte';
	import { type CoffeeSchema, type Process, processValues } from '$lib/zod-schemas';

	let { data, mode }: { data: SuperValidated<Infer<CoffeeSchema>>; mode: 'create' | 'edit' } =
		$props();

	const { form, enhance, errors } = superForm(data, {
		resetForm: mode === 'create'
	});

	const countryNames = Object.values(countries).map((country) => {
		return {
			value: country.name,
			label: country.name
		};
	});

	const initialState = $form;
	let hasChanged = $derived($form !== initialState);

	const processColorMap: Record<Process, string> = {
		washed: 'btn-success',
		honey: 'btn-warning',
		natural: 'btn-error',
		advanced: 'btn-primary'
	};

	let deleteDialog: HTMLDialogElement | undefined = $state(undefined);
</script>

<div class="card prose w-fit shadow-xl">
	<div class="card-body">
		<div class="card-title flex flex-row items-center justify-start">
			<button onclick={() => window.history.back()} class="btn btn-link text-primary-content p-0">
				<ChevronLeft />Back
			</button>
			<span class="text-primary-content text-xl">
				{mode === 'create' ? 'Add a new Coffee' : 'Edit existing Coffee'}
			</span>
		</div>
		<form id="coffeeForm" method="POST" use:enhance class="flex flex-col space-y-4">
			<label class="form-control w-full max-w-xs">
				<span class="text">Name</span>
				<input
					name="name"
					type="text"
					placeholder="Coffee Name"
					bind:value={$form.name}
					required
					class="input"
				/>
			</label>
			<label class="form-control w-full max-w-xs">
				Roaster
				<input
					name="roaster"
					type="text"
					placeholder="Roaster"
					bind:value={$form.roaster}
					class="input"
				/>
			</label>
			<label class="form-control w-full max-w-xs">
				Varietals
				<input
					name="varietals"
					type="text"
					placeholder="Varietals"
					bind:value={$form.varietals}
					class="input"
				/>
			</label>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">Process</legend>
				<span class="label">Category</span>
				<div class="join">
					{#each processValues as process}
						<input
							type="radio"
							name="process"
							class={['join-item btn', $form.process == process && processColorMap[process]]}
							aria-label={process}
							value={process}
							bind:group={$form.process}
						/>
					{/each}
				</div>
				<span class="label">Details</span>
				<input
					name="processDetails"
					type="text"
					placeholder="the process as stated on the bag"
					bind:value={$form.processDetails}
					aria-label="Process Details"
					class="input"
				/>
			</fieldset>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">Origin</legend>
				<span class="label">Country</span>
				<select name="country" bind:value={$form.country} class="select w-full max-w-xs">
					<option value={null} disabled selected={$form.country === null}
						>Select a country</option
					>
					{#each countryNames as countryName}
						<option value={countryName.value}>
							{countryName.value}
							{getEmojiFlag(getCountryCode(countryName.value) as TCountryCode)}
						</option>
					{/each}
				</select>
				<span class="label">Region</span>
				<input
					name="region"
					type="text"
					placeholder="Where in the country was the coffee grown?"
					bind:value={$form.region}
					class="input"
				/>
				<span class="label">Farm</span>
				<input
					name="farm"
					type="text"
					placeholder="What's the name of the farm or station?"
					bind:value={$form.farm}
					class="input"
				/>
				<span class="label">Elevation</span>
				<input
					name="elevation"
					type="text"
					placeholder="e.g. 1800m"
					bind:value={$form.elevation}
					class="input"
				/>
			</fieldset>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">Other</legend>
				<span class="label">Weight</span>
				<input
					name="weight"
					type="number"
					step="0.5"
					bind:value={$form.weight}
					required
					class="input {$errors.weight ? 'input-error' : ''}"
				/>
				{#if $errors.weight}
					<span class="label-text-alt text-error">{$errors.weight}</span>
				{/if}
				<span class="label">Roasting Date</span>
				<input name="roastingDate" type="date" bind:value={$form.roastingDate} class="input" />
				<span class="label">Tasting Notes</span>
				<input
					name="flavorProfile"
					type="text"
					placeholder="Add some tasting notes"
					bind:value={$form.flavorProfile}
					class="input"
				/>
				<span class="label">Description</span>
				<textarea name="description" bind:value={$form.description} class="textarea"></textarea>
				<span class="label">Notes</span>
				<textarea name="notes" bind:value={$form.notes} class="textarea"></textarea>
			</fieldset>
		</form>
		<div class="card-actions justify-end">
			{#if mode === 'create'}
				<input
					type="submit"
					value="Add Coffee"
					form="coffeeForm"
					formaction="?/create"
					class="btn btn-success"
				/>
			{:else}
				<input
					type="submit"
					value="Update"
					form="coffeeForm"
					formaction="?/update"
					disabled={!hasChanged}
					class="btn btn-primary"
				/>
				<button class="btn btn-error" onclick={() => deleteDialog!.showModal()}>Delete</button>
				<dialog bind:this={deleteDialog} class="modal">
					<div class="modal-box">
						<h3>Are you sure?</h3>
						<p class="py-4">This will delete the coffee permanently!</p>
						<div class="modal-action">
							<form method="dialog">
								<button class="btn">Cancel</button>
								<input
									type="submit"
									value="Delete"
									form="coffeeForm"
									formaction="?/delete"
									class="btn btn-error"
								/>
							</form>
						</div>
					</div>
				</dialog>
			{/if}
		</div>
	</div>
</div>
