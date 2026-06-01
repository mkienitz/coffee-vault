<script lang="ts">
	import 'flag-icons/css/flag-icons.min.css';
	import { getCountryFlag, getProcessBadgeClass } from '$lib/utils';
	import DoseList from './DoseList.svelte';
	import BrewTable from './BrewTable.svelte';
	import BagList from './BagList.svelte';
	import Pencil from 'lucide-svelte/icons/pencil';
	import type { PageProps } from './$types';
	import { getCoffee } from '$lib/data.remote';
	import { getBrews } from '$lib/brews.remote';
	import { getRemainingWeight, getUndosedWeight } from '$lib/inventory.remote';
	import { getBags } from '$lib/bags.remote';
	import { getNextTube, getTubes } from '$lib/tubes.remote';

	let { params }: PageProps = $props();
	const coffeeId = $derived(Number(params.coffeeId));
	const coffeeQuery = $derived(getCoffee(coffeeId));
	const remainingWeightQuery = $derived(getRemainingWeight(coffeeId));
	const undosedWeightQuery = $derived(getUndosedWeight(coffeeId));
	const nextTubeQuery = $derived(getNextTube(coffeeId));
	const tubesQuery = $derived(getTubes(coffeeId));
	const bagsQuery = $derived(getBags(coffeeId));
	const brewsQuery = $derived(getBrews(coffeeId));

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max);
	}

	function progressValue(weight: number, totalWeight: number) {
		if (!Number.isFinite(weight) || !Number.isFinite(totalWeight) || totalWeight <= 0) {
			return 0;
		}
		return clamp((weight / totalWeight) * 100, 0, 100);
	}

	function progressBarColor(weight: number, totalWeight: number) {
		if (weight < 7) return 'text-error';
		if (weight < 20) return 'text-warning';
		if (weight < 0.3 * totalWeight) return 'text-warning';
		return 'text-success';
	}

	function progressBackground(value: number) {
		return `conic-gradient(currentColor ${value}%, color-mix(in oklab, currentColor 15%, transparent) 0)`;
	}

	function formatWeight(weight: number) {
		return Number.isInteger(weight) ? String(weight) : weight.toFixed(1);
	}
</script>

{#snippet CoffeePanel()}
	{@const coffee = await coffeeQuery}
	{@const remainingWeight = await remainingWeightQuery}
	{@const undosedWeight = await undosedWeightQuery}
	{@const nextTube = await nextTubeQuery}
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
			class="col-span-full grid grid-cols-2 gap-4 {nextTube ? 'sm:col-span-2' : 'sm:col-span-3'}"
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

	{#snippet WeightProgress(label: string, weight: number, totalWeight: number)}
		{@const value = progressValue(weight, totalWeight)}
		<div class="stat place-items-center">
			<div class="stat-title font-medium tracking-wide uppercase">{label}</div>
			<div class="stat-value">
				<div
					class="relative grid size-18 shrink-0 place-items-center rounded-full {progressBarColor(
						weight,
						totalWeight
					)}"
					style:background={progressBackground(value)}
					aria-valuemin="0"
					aria-valuemax={totalWeight}
					aria-valuenow={weight}
					role="progressbar"
				>
					<div class="bg-base-100 absolute inset-1 rounded-full"></div>
					<div class="text-base-content relative flex flex-col items-center">
						<span class="text-lg font-bold">{formatWeight(weight)}g</span>
						<span class="text-base-content/60 text-xs">of {formatWeight(totalWeight)}g</span>
					</div>
				</div>
			</div>
		</div>
	{/snippet}

	<div class="stats w-full shadow">
		<div class="stat place-items-center">
			<div class="stat-title font-medium tracking-wide uppercase">Next Dose</div>
			<div class="stat-value">
				{#if nextTube}
					{@const tubeName = `${nextTube.drawer}${nextTube.tubeNumber}`}
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

		{@render WeightProgress('Remaining', remainingWeight, coffee.weight)}
		{@render WeightProgress('Undosed', undosedWeight, coffee.weight)}
	</div>
{/snippet}

<div class="flex w-full max-w-6xl flex-col items-center space-y-8">
	{@render CoffeePanel()}
	<div class="tabs tabs-lift tabs-xl">
		<label class="tab">
			<input type="radio" name="coffee-tab" checked={true} />
			<div class="flex items-center space-x-2">
				<span>Tubes</span>
				<span class="badge badge-xs">{(await tubesQuery).length}</span>
			</div>
		</label>
		<div class="tab-content bg-base-100 border-base-300 p-6">
			<DoseList {coffeeId} />
		</div>

		<label class="tab">
			<input type="radio" name="coffee-tab" />
			<div class="flex items-center space-x-2">
				<span>Bags</span>
				<span class="badge badge-xs">{(await bagsQuery).length}</span>
			</div>
		</label>
		<div class="tab-content bg-base-100 border-base-300 p-6">
			<BagList {coffeeId} />
		</div>

		<label class="tab">
			<input type="radio" name="coffee-tab" />
			<div class="flex items-center space-x-2">
				<span>Brews</span>
				<span class="badge badge-xs">{(await brewsQuery).length}</span>
			</div>
		</label>
		<div class="tab-content bg-base-100 border-base-300 p-6">
			<BrewTable {coffeeId} />
		</div>
	</div>
</div>
