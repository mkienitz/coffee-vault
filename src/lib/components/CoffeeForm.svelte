<script lang="ts">
	import { getCountryCode, getEmojiFlag, countries, type TCountryCode } from 'countries-list';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { ChevronLeft } from 'lucide-svelte';
	import { type CoffeeSchema } from '$lib/zod-schemas';

	let { data, mode }: { data: SuperValidated<Infer<CoffeeSchema>>; mode: 'create' | 'edit' } =
		$props();

	const { form, enhance } = superForm(data, {
		resetForm: mode === 'create'
	});

	const countryNames = Object.values(countries).map((country) => {
		return {
			value: country.name,
			label: country.name
		};
	});
</script>

<div class="card w-fit shadow-xl">
	<div class="card-body">
		<div class="card-title flex flex-row items-center justify-start">
			<button onclick={() => window.history.back()} class="btn btn-link text-primary-content">
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
					required
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
					required
					class="input"
				/>
			</label>
			<label class="form-control w-full max-w-xs">
				Process
				<input
					name="process"
					type="text"
					placeholder="Process"
					bind:value={$form.process}
					required
					class="input"
				/>
			</label>
			<label class="form-control w-full max-w-xs">
				Country
				<select name="country" bind:value={$form.country} class="select w-full max-w-xs">
					{#each countryNames as countryName}
						<option value={countryName.value}>
							{countryName.value}
							{getEmojiFlag(getCountryCode(countryName.value) as TCountryCode)}
						</option>
					{/each}
				</select>
			</label>
			<label class="form-control w-full max-w-xs">
				Region
				<input
					name="region"
					type="text"
					placeholder="Region"
					bind:value={$form.region}
					required
					class="input"
				/>
			</label>
			<label class="form-control w-full max-w-xs">
				Farm
				<input name="farm" type="text" placeholder="Farm" bind:value={$form.farm} class="input" />
			</label>
			<label class="form-control w-full max-w-xs">
				Elevation
				<input
					name="elevation"
					type="text"
					placeholder="Elevation"
					bind:value={$form.elevation}
					required
					class="input"
				/>
			</label>
			<label class="form-control w-full max-w-xs">
				Weight
				<input
					name="weight"
					type="number"
					step="0.5"
					bind:value={$form.weight}
					required
					class="input"
				/>
			</label>
			<label class="form-control w-full max-w-xs">
				Roasting Date
				<input
					name="roastingDate"
					type="date"
					bind:value={$form.roastingDate}
					required
					class="input"
				/>
			</label>
			<label class="form-control w-full max-w-xs">
				Tasting Notes
				<input
					name="flavorProfile"
					type="text"
					placeholder="Add some tasting notes"
					bind:value={$form.flavorProfile}
					required
					class="input"
				/>
			</label>
			<label class="form-control flex w-full max-w-xs flex-col">
				Notes
				<textarea name="notes" bind:value={$form.notes} class="textarea"> </textarea>
			</label>
		</form>
		<div class="card-actions">
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
					class="btn btn-primary"
				/>
				<input
					type="submit"
					value="Delete"
					form="coffeeForm"
					formaction="?/delete"
					class="btn btn-error"
				/>
			{/if}
		</div>
	</div>
</div>
