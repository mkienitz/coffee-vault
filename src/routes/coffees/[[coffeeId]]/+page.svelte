<script lang="ts">
	import { getCountryCode, getEmojiFlag, type TCountryCode } from 'countries-list';
	import { coffeeSchema } from '$lib/schemas';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { ChevronLeft } from 'lucide-svelte';

	let { data } = $props();
	const { form, errors, enhance } = superForm(data.form, {
		resetForm: false,
		validators: zodClient(coffeeSchema)
	});
</script>

<div class="card w-fit shadow-xl">
	<div class="card-body">
		<div class="card-title flex flex-row items-center justify-start">
			<button onclick={() => window.history.back()} class="btn">
				<ChevronLeft />Back
			</button>
			<span class="text-primary-content text-xl">
				{!$form.id ? 'Add a new Coffee' : 'Edit existing Coffee'}
			</span>
		</div>
		<form id="coffeeForm" method="POST" use:enhance class="flex flex-col space-y-4">
			<input hidden bind:value={$form.id} name="id" />
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
					{#each data.countryNames as countryName}
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
				<textarea name="flavorProfile" bind:value={$form.notes} class="textarea"> </textarea>
			</label>
		</form>
		<div class="card-actions">
			{#if $form.id}
				<input type="submit" form="coffeeForm" class="btn btn-primary" value="Update" />
				<input type="submit" form="coffeeForm" class="btn btn-error" name="delete" value="Delete" />
			{:else}
				<input type="submit" form="coffeeForm" class="btn btn-success" value="Add Coffee" />
			{/if}
		</div>
	</div>
</div>
{$errors}
<SuperDebug data={$form} />
