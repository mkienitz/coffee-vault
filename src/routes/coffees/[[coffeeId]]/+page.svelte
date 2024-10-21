<script lang="ts">
	import { getCountryCode, getEmojiFlag, type TCountryCode } from 'countries-list';
	import { coffeeSchema } from '$lib/schemas';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let { data } = $props();
	const { form, enhance } = superForm(data.form, {
		resetForm: false,
		validators: zodClient(coffeeSchema)
	});

	// Modal
	let modalOpen = $state(false);
</script>

<form id="coffeeForm" method="POST" use:enhance class="max-w-[540px]">
	<h2>
		{#if !$form.id}
			Add a new Coffee
		{:else}
			Edit Coffee
		{/if}
	</h2>

	<input hidden bind:value={$form.id} name="id" />
	<label>
		Name
		<input type="text" name="name" bind:value={$form.name} />
	</label>
	<label>
		Roaster
		<input type="text" name="roaster" bind:value={$form.roaster} />
	</label>
	<label>
		Varietals
		<input type="text" name="varietals" bind:value={$form.varietals} />
	</label>
	<label>
		Process
		<input type="text" name="process" bind:value={$form.process} />
	</label>
	<div class="grid">
		<label>
			Country
			<select name="country" bind:value={$form.country}>
				<option selected disabled value="">Please select a country</option>
				{#each data.countryNames as countryName}
					<option value={countryName}>
						{`${countryName}  ${getEmojiFlag(getCountryCode(countryName) as TCountryCode)}`}
					</option>
				{/each}
			</select>
		</label>
		<label>
			Region
			<input type="text" name="region" bind:value={$form.region} />
		</label>
	</div>
	<div class="grid">
		<label>
			Farm
			<input type="text" name="farm" bind:value={$form.farm} />
		</label>
		<label>
			Elevation
			<input type="text" name="elevation" bind:value={$form.elevation} />
		</label>
	</div>
	<div class="grid">
		<label>
			Weight
			<input type="number" min="2" step="0.5" name="weight" bind:value={$form.weight} />
		</label>
		<label>
			Roasting Date
			<input type="date" name="roastingDate" bind:value={$form.roastingDate} />
		</label>
	</div>
	<label>
		Tasting Notes
		<input type="text" name="flavorProfile" bind:value={$form.flavorProfile} />
	</label>
	<label>
		Notes
		<textarea bind:value={$form.notes} placeholder="You can add some notes here"></textarea>
	</label>

	<input type="submit" value={$form.id ? 'Save Changes' : 'Add Coffee'} />
	{#if $form.id}
		<input
			type="submit"
			class="contrast"
			onclick={(e) => {
				e.preventDefault();
				modalOpen = true;
			}}
			value="Delete Coffee"
		/>
	{/if}
	{#if $form.id}
		<dialog open={modalOpen}>
			<article>
				<h3>Are you sure?</h3>
				<p>This action cannot be undone. This will permanently delete the coffee.</p>
				<footer>
					<button
						onclick={(e) => {
							e.preventDefault();
							modalOpen = false;
						}}>Cancel</button
					>
					<button name="delete" class="contrast"> Delete Coffee</button>
				</footer>
			</article>
		</dialog>
	{/if}
</form>
