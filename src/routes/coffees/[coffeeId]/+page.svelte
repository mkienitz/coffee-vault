<script lang="ts">
	import 'flag-icons/css/flag-icons.min.css';
	import { getCountryFlag, getProcessBadgeClass } from '$lib/utils';
	import DoseList from './DoseList.svelte';
	import BrewTable from './BrewTable.svelte';
	import FreeformDoseList from './FreeformDoseList.svelte';
	import Pencil from 'lucide-svelte/icons/pencil';
	import type { PageProps } from './$types';
	import { getCoffee } from '$lib/data.remote';
	import {
		getBrews,
		getCoffeeLeftToDose,
		getDoses,
		getFreeFormDoses,
		getNextDose,
		getRemainingWeight
	} from './data.remote';

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
	{@const leftToDose = await getCoffeeLeftToDose(coffee.id)}
	{@const nextDose = await getNextDose(coffee.id)}
	{@const originInfo = [coffee.farm, coffee.region, coffee.country]
		.filter((v) => v && v !== '')
		.join(', ')}

	<!-- Title Bar -->
	<div class="min-w-0 flex-1 space-y-1">
		<h1 class="flex items-center space-x-3 text-2xl font-bold sm:text-3xl">
			{#if coffee.country}
				<span class="fi fi-{getCountryFlag(coffee.country)}"></span>
			{/if}
			<span>{coffee.name}</span>
			<a href="/coffees/{coffee.id}/edit"><Pencil class="text-base-content/60" /></a>
		</h1>
		<div class="text-base-content/60 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
			<span>{coffee.roaster ?? 'Unknown Roaster'}</span>
			{#if coffee.roastingDate}
				<span class="hidden sm:inline">•</span>
				<span>{coffee.roastingDate}</span>
			{/if}
		</div>
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

	<div class="grid grid-cols-2 gap-4">
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
			{#if coffee.producer}
				{@render InfoCard('Producer', coffee.producer)}
			{/if}
		</div>
	</div>

	{#if coffee.description || coffee.notes}
		{#snippet CollapsibleSection(title: string, content: string, fullWidth: boolean = false)}
			<div
				class="bg-base-100 sm:collapse-open collapse-arrow collapse sm:[&_.collapse-title]:after:hidden {fullWidth
					? 'sm:col-span-2'
					: ''}"
			>
				<input type="checkbox" class="peer sm:hidden" />
				<div class="collapse-title p-4 pb-2 sm:cursor-auto!">
					<h3 class="text-base-content/60 text-xs font-medium tracking-wide uppercase">
						{title}
					</h3>
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

	<div class="stats w-full shadow">
		<div class="stat place-items-center">
			<div class="stat-title font-medium tracking-wide uppercase">Next Dose</div>
			<div class="stat-value">
				{#if nextDose}
					{@const tubeName = `${nextDose.drawer}${nextDose.tubeNumber}`}
					<a href="/doses/{tubeName}" class="link">
						<div
							class="border-primary bg-base-200 flex h-20 w-20 items-center justify-center rounded-full border-[0.25rem]"
						>
							<span class="font-mono text-xl font-bold">{tubeName}</span>
						</div>
					</a>
				{:else}
					<div
						class="border-base-content/20 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[0.25rem] font-mono text-lg font-bold"
					>
						--
					</div>
				{/if}
				<!-- TODO: add alternative placeholder if there is no next dose -->
			</div>
			<!-- <div class="stat-desc">Jan 1st - Feb 1st</div> -->
		</div>

		<div class="stat place-items-center">
			<div class="stat-title font-medium tracking-wide uppercase">Remaining</div>
			<div class="stat-value">
				<div
					class="radial-progress {progressBarColor(remainingWeight, coffee.weight)}"
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

		<div class="stat place-items-center">
			<div class="stat-title font-medium tracking-wide uppercase">Undosed</div>
			<div class="stat-value">
				<div
					class="radial-progress {progressBarColor(leftToDose, coffee.weight)}"
					style="--value:{(leftToDose / coffee.weight) * 100}; --size:4.5rem; --thickness:0.25rem;"
					aria-valuenow={leftToDose}
					role="progressbar"
				>
					<div class="text-base-content flex flex-col items-center">
						<span class="text-lg font-bold">{leftToDose}g</span>
						<span class="text-base-content/60 text-xs">of {coffee.weight}g</span>
					</div>
				</div>
			</div>
		</div>
	</div>
{/snippet}

<div class="w-full max-w-6xl space-y-8 flex flex-col items-center">
	{@render CoffeePanel()}
	<div class="tabs tabs-lift tabs-xl">
		<label class="tab">
			<input type="radio" name="coffee-tab" checked={true} />
			<div class="flex items-center space-x-2">
				<span>Tubes</span>
				<span class="badge badge-xs">{(await getDoses(coffeeId)).length}</span>
			</div>
		</label>
		<div class="tab-content bg-base-100 border-base-300 p-6">
			<DoseList {coffeeId} />
		</div>

		<label class="tab">
			<input type="radio" name="coffee-tab" />
			<div class="flex items-center space-x-2">
				<span>Bags</span>
				<span class="badge badge-xs">{(await getFreeFormDoses(coffeeId)).length}</span>
			</div>
		</label>
		<div class="tab-content bg-base-100 border-base-300 p-6">
			<FreeformDoseList {coffeeId} />
		</div>

		<label class="tab">
			<input type="radio" name="coffee-tab" />
			<div class="flex items-center space-x-2">
				<span>Brews</span>
				<span class="badge badge-xs">{(await getBrews(coffeeId)).length}</span>
			</div>
		</label>
		<div class="tab-content bg-base-100 border-base-300 p-6">
			<BrewTable {coffeeId} />
		</div>
	</div>
</div>
