<script lang="ts">
	import { getCountryCode, getEmojiFlag, type TCountryCode } from 'countries-list';
	import { type Coffee, type Dose } from '$lib/zod-schemas';

	const { coffee, doses }: { coffee: Coffee; doses: Dose[] } = $props();

	const remainingWeight = $derived(
		coffee.weight - doses.map((d) => d.weight!).reduce((a, b) => a + b, 0)
	);
</script>

<div class="card flex w-[400px] flex-col shadow-xl">
	<div class="card-body flex flex-col space-y-8">
		<div class="card-title flex flex-col space-y-1">
			<div class="flex w-[100%] flex-row items-center justify-between">
				<div class="text-2xl">
					{`${getEmojiFlag(getCountryCode(coffee.country) as TCountryCode)} ${coffee.name}`}
				</div>
				<a href={`/coffees/${coffee.id}/edit`} class="h-fit w-fit p-0">Edit</a>
			</div>
			<div class="flex w-[100%] flex-row items-center justify-between">
				<small class="text-muted-foreground">{coffee.roaster}</small>
				<small class="text-muted-foreground">{coffee.roastingDate}</small>
			</div>
		</div>
		<div class="flex grow flex-col space-y-4 py-0">
			<div class="flex flex-col space-y-1">
				<div class="font-bold">Origin</div>
				<div class="text-muted-foreground text-sm">
					{[coffee.farm, coffee.region, coffee.country].filter((v) => v !== '').join(', ')}
				</div>
			</div>
			{#if coffee.producer !== ''}
				<div class="flex flex-col space-y-1">
					<div class="font-bold">Producer</div>
					<div class="text-muted-foreground text-sm">{coffee.producer}</div>
				</div>
			{/if}
			<div class="flex flex-col space-y-1">
				<div class="font-bold">Varietals</div>
				<div class="text-muted-foreground text-sm">{coffee.varietals}</div>
			</div>
			<div class="flex flex-col space-y-1">
				<div class="font-bold">Process</div>
				<div class="text-muted-foreground text-sm">{coffee.process}</div>
			</div>
			{#if coffee.notes !== ''}
				<div class="flex flex-col space-y-1">
					<div class="font-bold">Notes</div>
					<div class="text-muted-foreground text-sm">{coffee.notes}</div>
				</div>
			{/if}
			<div class="flex flex-col space-y-1">
				<div class="font-bold">Flavor Profile</div>
				<div class="text-muted-foreground text-sm">{coffee.flavorProfile}</div>
			</div>
		</div>
		<div class="flex w-full flex-row justify-between">
			<div>
				<div class="badge badge-accent">some</div>
				<div class="badge badge-primary">badges</div>
			</div>
			<div class="flex flex-row items-center space-x-2">
				<progress class="progress w-[80px]" value={remainingWeight} max={coffee.weight}></progress>
				<div class="text-muted-foreground text-sm">{remainingWeight}/{coffee.weight}g</div>
			</div>
		</div>
	</div>
</div>
