<script lang="ts">
	import { type Coffee, type Dose, type Brew } from '$lib/zod-schemas';
	import { getCoffeeFlag } from '$lib/utils';

	const { coffee, doses, brews }: { coffee: Coffee; doses: Dose[]; brews: Brew[] } = $props();

	const remainingWeight = $derived(
		coffee.weight - brews.reduce((acc, brew) => acc + brew.weight, 0)
	);

	const progressBarColor = $derived.by(() => {
		if (remainingWeight < 7) {
			return 'text-red-500';
		} else if (remainingWeight < 20) {
			return 'text-orange-500';
		} else if (remainingWeight < 0.3 * coffee.weight) {
			return 'text-yellow-500';
		} else {
			return 'text-green-500';
		}
	});
	const originInfo = [coffee.farm, coffee.region, coffee.country]
		.filter((v) => v && v !== '')
		.join(', ');
</script>

<div class="card flex max-h-fit w-[400px] flex-col shadow-xl">
	<div class="card-body flex flex-col space-y-8">
		<div class="card-title flex flex-col space-y-1">
			<div class="flex w-[100%] flex-row items-center justify-between">
				<a href="/coffees/{coffee.id}" class="text-2xl">
					{`${getCoffeeFlag(coffee)} ${coffee.name}`}
				</a>
				<a href="/coffees/{coffee.id}/edit" class="link h-fit w-fit p-0">Edit</a>
			</div>
			<div class="flex w-[100%] flex-row items-center justify-between">
				<small class="text-base-content/70">{coffee.roaster ?? 'Unknown Roaster'}</small>
				<small class="text-base-content/70">{coffee.roastingDate ?? 'Unknown Roasting Date'}</small>
			</div>
		</div>
		<div class="flex grow flex-col space-y-4 py-0">
			<div class="flex flex-col space-y-1">
				<div class="font-bold">Origin</div>
				<div class="text-base-content/70 text-sm">
					{originInfo === '' ? 'Unknown' : originInfo}
				</div>
			</div>
			{#if coffee.producer}
				<div class="flex flex-col space-y-1">
					<div class="font-bold">Producer</div>
					<div class="text-base-content/70 text-sm">{coffee.producer}</div>
				</div>
			{/if}
			<div class="flex flex-col space-y-1">
				<div class="font-bold">Varietals</div>
				<div class="text-base-content/70 text-sm">{coffee.varietals ?? 'Unknown'}</div>
			</div>
			<div class="flex flex-col space-y-1">
				<div class="font-bold">Process</div>
				<div class="text-base-content/70 text-sm">{coffee.processDetails ?? 'Unknown'}</div>
			</div>
			{#if coffee.flavorProfile}
				<div class="flex flex-col space-y-1">
					<div class="font-bold">Flavor Profile</div>
					<div class="text-base-content/70 text-sm">{coffee.flavorProfile}</div>
				</div>
			{/if}
			{#if coffee.description}
				<div class="flex flex-col space-y-1">
					<div class="font-bold">Description</div>
					<div class="text-base-content/70 text-sm">{coffee.description}</div>
				</div>
			{/if}
			{#if coffee.notes}
				<div class="flex flex-col space-y-1">
					<div class="font-bold">Notes</div>
					<div class="text-base-content/70 text-sm">{coffee.notes}</div>
				</div>
			{/if}
		</div>
		<div class="flex flex-row items-center space-x-2 self-end">
			<progress
				class="progress w-[160px] {progressBarColor}"
				value={remainingWeight}
				max={coffee.weight}
			></progress>
			<div class="text-base-content/70 text-sm">{remainingWeight}/{coffee.weight}g</div>
		</div>
	</div>
</div>
