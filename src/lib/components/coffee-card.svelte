<script lang="ts">
	import { getCountryCode, getEmojiFlag, type TCountryCode } from 'countries-list';
	import type { CoffeeWithDoses } from '$lib/schemas';
	let { coffee = $bindable() }: { coffee: CoffeeWithDoses } = $props();
	const remainingWeight = $derived(
		coffee.weight -
			coffee.doses
				.filter((d) => d.consumedOn)
				.map((d) => d.weight)
				.reduce((a, b) => a + b, 0)
	);
</script>

{#snippet coffeeField(fieldName: keyof CoffeeWithDoses, title: string | undefined = undefined)}
	<hgroup>
		<h5>{title ? title : fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}</h5>
		<p>{coffee[fieldName]}</p>
	</hgroup>
{/snippet}

<article style="max-width: 50rem;">
	<header style="display: flex; flex-direction: row; justify-content: space-between">
		<hgroup>
			<h2>{`${getEmojiFlag(getCountryCode(coffee.country) as TCountryCode)} ${coffee.name}`}</h2>
			<p>{coffee.roaster}</p>
		</hgroup>
		<a href={`/coffees/${coffee.id}`} style="justify-self: end">Edit Coffee</a>
	</header>
	<main>
		<hgroup>
			<h5>Origin</h5>
			<p>
				{[coffee.farm, coffee.region, coffee.country].filter((v) => v !== '').join(', ')}
			</p>
		</hgroup>
		{#if coffee.producer !== ''}
			{@render coffeeField('producer')}
		{/if}
		{@render coffeeField('varietals')}
		{@render coffeeField('process')}
		{@render coffeeField('varietals')}
		{@render coffeeField('flavorProfile', 'Flavor Profile')}
		{#if coffee.notes !== ''}
			{@render coffeeField('notes')}
		{/if}
	</main>
	<footer class="grid">
		<a href={`/coffees/${coffee.id}/doses`} class="contrast">
			<div>
				Remaining Coffee: {remainingWeight}/{coffee.weight}g
				<progress value={remainingWeight} max={coffee.weight}></progress>
			</div>
		</a>
		<small style="justify-self: end">Roasted on {coffee.roastingDate}</small>
	</footer>
</article>
