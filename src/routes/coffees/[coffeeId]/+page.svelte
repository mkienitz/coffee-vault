<script lang="ts">
	import 'flag-icons/css/flag-icons.min.css';
	import { getCountryFlag, getProcessBadgeClass } from '$lib/utils';
	import DoseList from './DoseList.svelte';
	import BrewTable from './BrewTable.svelte';
	import FreeformDoseList from './FreeformDoseList.svelte';
	import type { PageProps } from './$types';
	import { getCoffee } from '$lib/data.remote';
	import { getNextDose, getRemainingWeight } from './data.remote';

	let { params }: PageProps = $props();
	const coffeeId = $derived(Number(params.coffeeId));

	function progressBarColor(remainingWeight: number, totalWeight: number) {
		if (remainingWeight < 7) return 'text-error';
		if (remainingWeight < 20) return 'text-warning';
		if (remainingWeight < 0.3 * totalWeight) return 'text-warning';
		return 'text-success';
	}
</script>

{#snippet CoffeePanel()}
	{@const coffee = await getCoffee(coffeeId)}
	{@const remainingWeight = await getRemainingWeight(coffee.id)}
	{@const nextDose = await getNextDose(coffee.id)}
	{@const originInfo = [coffee.farm, coffee.region, coffee.country]
		.filter((v) => v && v !== '')
		.join(', ')}
	<!-- Title Bar -->
	<div class="flex items-start justify-between gap-4">
		<div class="min-w-0 flex-1 space-y-1">
			<h1 class="text-2xl font-bold sm:text-3xl">
				{#if coffee.country}
					<span class="fi fi-{getCountryFlag(coffee.country)}"></span>
				{/if}
				{coffee.name}
			</h1>
			<div class="text-base-content/60 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
				<span>{coffee.roaster ?? 'Unknown Roaster'}</span>
				{#if coffee.roastingDate}
					<span class="hidden sm:inline">•</span>
					<span>{coffee.roastingDate}</span>
				{/if}
			</div>
		</div>
		<a href="/coffees/{coffee.id}/edit" class="btn btn-outline btn-sm shrink-0">Edit</a>
	</div>

	<!-- Stats Grid -->
	{#snippet InfoCard(label: string, value: string)}
		<div class="card bg-base-100">
			<div class="card-body gap-1 p-4">
				<h3 class="text-base-content/60 text-xs font-medium tracking-wide uppercase">{label}</h3>
				<p class="text-sm font-medium">{value}</p>
			</div>
		</div>
	{/snippet}

	<div class="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:items-start">
		<div
			class="col-span-full grid grid-cols-2 gap-4 {nextDose ? 'sm:col-span-2' : 'sm:col-span-3'}"
		>
			{#if coffee.varietals}
				{@render InfoCard('Varietals', coffee.varietals)}
			{/if}
			<div class="card bg-base-100">
				<div class="card-body gap-1 p-4">
					<div class="flex items-center gap-2">
						<h3 class="text-base-content/60 text-xs font-medium tracking-wide uppercase">
							Process
						</h3>
						{#if coffee.process}
							<div class="badge badge-sm badge-soft {getProcessBadgeClass(coffee.process)}">
								{coffee.process}
							</div>
						{/if}
					</div>
					<p class="text-sm font-medium">{coffee.processDetails ?? 'Unknown'}</p>
				</div>
			</div>
			{#if originInfo !== ''}
				{@render InfoCard('Origin', originInfo)}
			{/if}
			{#if coffee.flavorProfile}
				{@render InfoCard('Flavor', coffee.flavorProfile)}
			{/if}
		</div>

		{#if nextDose}
			{@const tubeName = `${nextDose.drawer}${nextDose.tubeNumber}`}
			<div class="card bg-base-100">
				<div class="card-body gap-1 p-4 sm:items-center sm:justify-center">
					<h3 class="text-base-content/60 text-xs font-medium tracking-wide uppercase">
						Next Dose
					</h3>
					<a href="/doses/{tubeName}" class="link self-start sm:self-auto">
						<div
							class="border-primary bg-base-200 flex h-20 w-20 items-center justify-center rounded-full border-[0.25rem]"
						>
							<span class="font-mono text-xl font-bold">{tubeName}</span>
						</div>
					</a>
				</div>
			</div>
		{/if}
		<!-- TODO: add alternative placeholder if there is no next dose -->

		<div class="card bg-base-100">
			<div class="card-body gap-1 p-4 sm:items-center sm:justify-center">
				<h3 class="text-base-content/60 text-xs font-medium tracking-wide uppercase">Remaining</h3>
				<div
					class="radial-progress {progressBarColor(
						remainingWeight,
						coffee.weight
					)} self-start sm:self-auto"
					style="--value:{(remainingWeight / coffee.weight) *
						100}; --size:4.5rem; --thickness:0.25rem;"
					aria-valuenow={remainingWeight}
					role="progressbar"
				>
					<div class="text-base-content flex flex-col items-center">
						<span class="text-lg font-bold">{remainingWeight}g</span>
						<span class="text-base-content/60 text-xs">of {coffee.weight}g</span>
					</div>
				</div>
			</div>
		</div>

		<!-- <div class="card bg-base-100"> -->
		<!-- 	<div class="card-body gap-1 p-4 sm:items-center sm:justify-center"> -->
		<!-- 		<h3 class="text-base-content/60 text-xs font-medium tracking-wide uppercase"> -->
		<!-- 			Left to Dose -->
		<!-- 		</h3> -->
		<!-- 		<div -->
		<!-- 			class="radial-progress {progressBarColor( -->
		<!-- 				leftToDose, -->
		<!-- 				remainingWeight -->
		<!-- 			)} self-start sm:self-auto" -->
		<!-- 			style="--value:{(leftToDose / remainingWeight) * -->
		<!-- 				100}; --size:4.5rem; --thickness:0.25rem;" -->
		<!-- 			aria-valuenow={leftToDose} -->
		<!-- 			role="progressbar" -->
		<!-- 		> -->
		<!-- 			<div class="text-base-content flex flex-col items-center"> -->
		<!-- 				<span class="text-lg font-bold">{leftToDose}g</span> -->
		<!-- 				<span class="text-base-content/60 text-xs">of {remainingWeight}g</span> -->
		<!-- 			</div> -->
		<!-- 		</div> -->
		<!-- 	</div> -->
		<!-- </div> -->
	</div>

	{#if coffee.producer}
		{@render InfoCard('Producer', coffee.producer)}
	{/if}

	{#if coffee.description || coffee.notes}
		{#snippet CollapsibleSection(title: string, content: string, fullWidth: boolean = false)}
			<div
				class="bg-base-100 sm:collapse-open collapse-arrow collapse sm:[&_.collapse-title]:after:hidden {fullWidth
					? 'sm:col-span-2'
					: ''}"
			>
				<input type="checkbox" class="peer sm:hidden" />
				<div class="collapse-title p-4 pb-2 sm:cursor-auto!">
					<h3 class="text-base-content/60 text-xs font-medium tracking-wide uppercase">{title}</h3>
				</div>
				<div class="collapse-content px-4 pt-0">
					<p class="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
				</div>
			</div>
		{/snippet}

		<div class="grid gap-4 sm:grid-cols-2">
			{#if coffee.description}
				{@render CollapsibleSection('Description', coffee.description, !coffee.notes)}
			{/if}
			{#if coffee.notes}
				{@render CollapsibleSection('Notes', coffee.notes, !coffee.description)}
			{/if}
		</div>
	{/if}
{/snippet}

<div class="w-full max-w-6xl space-y-8">
	{@render CoffeePanel()}
	<div class="grid gap-8 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
		<!-- Doses -->
		<div class="space-y-4">
			<h2 class="text-2xl font-bold">Tubes</h2>
			<DoseList {coffeeId} />
		</div>

		<div class="divider lg:divider-horizontal"></div>

		<!-- Free-form Doses -->
		<div class="space-y-4">
			<h2 class="text-2xl font-bold">Other Doses</h2>
			<FreeformDoseList {coffeeId} />
		</div>

		<div class="divider lg:divider-horizontal"></div>

		<!-- Brews -->
		<div class="space-y-4">
			<h2 class="text-2xl font-bold">Brews</h2>
			<BrewTable {coffeeId} />
		</div>
	</div>
</div>
