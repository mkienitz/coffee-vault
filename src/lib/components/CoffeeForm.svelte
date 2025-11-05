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

<div class="card w-full max-w-2xl shadow-xl">
	<div class="card-body">
		<div class="relative mb-4">
			<button onclick={() => window.history.back()} class="btn btn-link absolute left-0 p-0">
				<ChevronLeft />Back
			</button>
			<h2 class="text-center text-xl font-bold">
				{mode === 'create' ? 'Add a new Coffee' : 'Edit existing Coffee'}
			</h2>
		</div>
		<form id="coffeeForm" method="POST" use:enhance class="space-y-4">
			<div class="form-control">
				<span class="label-text mb-1">Name</span>
				<input
					name="name"
					type="text"
					placeholder="Coffee Name"
					bind:value={$form.name}
					required
					class="input w-full"
				/>
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Roaster</span>
				<input
					name="roaster"
					type="text"
					placeholder="Roaster"
					bind:value={$form.roaster}
					class="input w-full"
				/>
			</div>
			<div class="form-control">
				<span class="label-text mb-1">Varietals</span>
				<input
					name="varietals"
					type="text"
					placeholder="Varietals"
					bind:value={$form.varietals}
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
								type="radio"
								name="process"
								class={[
									'join-item btn btn-sm flex-1',
									$form.process == process && processColorMap[process]
								]}
								aria-label={process}
								value={process}
								bind:group={$form.process}
							/>
						{/each}
					</div>
				</div>
				<div class="form-control">
					<span class="label-text mb-1">Details</span>
					<input
						name="processDetails"
						type="text"
						placeholder="the process as stated on the bag"
						bind:value={$form.processDetails}
						aria-label="Process Details"
						class="input w-full"
					/>
				</div>
			</fieldset>
			<fieldset class="space-y-2">
				<legend class="mb-2 text-base font-semibold">Origin</legend>
				<div class="form-control">
					<span class="label-text mb-1">Country</span>
					<select name="country" bind:value={$form.country} class="select w-full">
						<option value={null} disabled selected={$form.country === null}>Select a country</option
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
						name="region"
						type="text"
						placeholder="Where in the country was the coffee grown?"
						bind:value={$form.region}
						class="input w-full"
					/>
				</div>
				<div class="form-control">
					<span class="label-text mb-1">Farm</span>
					<input
						name="farm"
						type="text"
						placeholder="What's the name of the farm or station?"
						bind:value={$form.farm}
						class="input w-full"
					/>
				</div>
				<div class="form-control">
					<span class="label-text mb-1">Elevation</span>
					<input
						name="elevation"
						type="text"
						placeholder="e.g. 1800m"
						bind:value={$form.elevation}
						class="input w-full"
					/>
				</div>
			</fieldset>
			<fieldset class="space-y-2">
				<legend class="mb-2 text-base font-semibold">Other</legend>
				<div class="form-control">
					<span class="label-text mb-1">Weight</span>
					<input
						name="weight"
						type="number"
						step="0.5"
						bind:value={$form.weight}
						required
						class="input w-full {$errors.weight ? 'input-error' : ''}"
					/>
					{#if $errors.weight}
						<span class="label-text-alt text-error">{$errors.weight}</span>
					{/if}
				</div>
				<div class="form-control">
					<span class="label-text mb-1">Roasting Date</span>
					<input
						name="roastingDate"
						type="date"
						bind:value={$form.roastingDate}
						class="input w-full"
					/>
				</div>
				<div class="form-control">
					<span class="label-text mb-1">Tasting Notes</span>
					<input
						name="flavorProfile"
						type="text"
						placeholder="Add some tasting notes"
						bind:value={$form.flavorProfile}
						class="input w-full"
					/>
				</div>
				<div class="form-control">
					<span class="label-text mb-1">Description</span>
					<textarea name="description" bind:value={$form.description} class="textarea w-full"
					></textarea>
				</div>
				<div class="form-control">
					<span class="label-text mb-1">Notes</span>
					<textarea name="notes" bind:value={$form.notes} class="textarea w-full"></textarea>
				</div>
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
