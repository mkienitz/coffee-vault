<script lang="ts">
	import 'flag-icons/css/flag-icons.min.css';
	import { getCountryFlag, getProcessBadgeClass, getTubeName } from '#lib/utils.js';
	import DoseList from './DoseList.svelte';
	import BrewTable from './BrewTable.svelte';
	import BagList from './BagList.svelte';
	import Pencil from 'lucide-svelte/icons/pencil';
	import type { PageProps } from './$types';
	import { getCoffee } from '#lib/data.remote.js';
	import { getRemainingWeight, getUndosedWeight } from '#lib/inventory.remote.js';
	import { getBags } from '#lib/bags.remote.js';
	import { getNextTube, getTubes } from '#lib/tubes.remote.js';

	let { params }: PageProps = $props();
	const coffeeId = $derived(Number(params.coffeeId));
	const coffeeQuery = $derived(getCoffee(coffeeId));
	const remainingWeightQuery = $derived(getRemainingWeight(coffeeId));
	const undosedWeightQuery = $derived(getUndosedWeight(coffeeId));
	const nextTubeQuery = $derived(getNextTube(coffeeId));
	const tubesQuery = $derived(getTubes(coffeeId));
	const bagsQuery = $derived(getBags(coffeeId));
	const tabGroup = $props.id();

	function progressValue(weight: number, totalWeight: number) {
		if (!Number.isFinite(weight) || !Number.isFinite(totalWeight) || totalWeight <= 0) return 0;
		return Math.min(Math.max((weight / totalWeight) * 100, 0), 100);
	}

	function formatWeight(weight: number) {
		return Number.isInteger(weight) ? String(weight) : weight.toFixed(1);
	}
</script>

{#snippet Detail(label: string, value: string | undefined)}
	{#if value}
		<div class="space-y-1">
			<dt class="text-base-content/60 text-sm">{label}</dt>
			<dd class="text-sm leading-relaxed break-words">{value}</dd>
		</div>
	{/if}
{/snippet}

{#snippet CoffeePage()}
	{@const coffee = await coffeeQuery}
	{@const remainingWeight = await remainingWeightQuery}
	{@const undosedWeight = await undosedWeightQuery}
	{@const nextTube = await nextTubeQuery}
	{@const tubeCount = (await tubesQuery).length}
	{@const bagCount = (await bagsQuery).length}
	<div class="w-full max-w-5xl space-y-8 py-4 sm:py-6">
		<header class="flex items-start justify-between gap-4">
			<div class="min-w-0 space-y-3">
				{#if coffee.roaster || coffee.roastingDate}
					<p class="text-base-content/65 text-sm font-medium">
						{coffee.roaster ?? ''}
						{#if coffee.roastingDate}
							<span
								class="text-base-content/50 font-normal whitespace-nowrap"
								title="Roasted {coffee.roastingDate}"
							>
								<span class="sr-only">Roasted </span>(<time datetime={coffee.roastingDate}
									>{coffee.roastingDate.slice(2, 10).replaceAll('-', '/')}</time
								>)
							</span>
						{/if}
					</p>
				{/if}
				<h1 class="text-3xl leading-tight font-semibold tracking-tight break-words sm:text-4xl">
					{coffee.name}
				</h1>
				<div class="text-base-content/65 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
					{#if coffee.country}
						<span class="inline-flex items-center gap-2">
							<span class="fi fi-{getCountryFlag(coffee.country)} rounded-xs" aria-hidden="true"
							></span>
							{coffee.country}
						</span>
					{/if}
					{#if coffee.process}
						<span class="badge badge-soft badge-sm {getProcessBadgeClass(coffee.process)}"
							>{coffee.process}</span
						>
					{/if}
					{#if coffee.varietals}
						<span class="min-w-0 break-words"
							><span class="sr-only">Varietals: </span>{coffee.varietals}</span
						>
					{/if}
				</div>
			</div>
			<a
				href="/coffees/{coffee.id}/edit"
				class="btn btn-ghost btn-sm shrink-0"
				aria-label="Edit coffee"
			>
				<Pencil size={16} /> Edit
			</a>
		</header>

		<section class="space-y-6" aria-label="About this coffee">
			{#if coffee.flavorProfile}
				<div class="space-y-1.5">
					<h2 class="text-base-content/60 text-sm">Tasting notes</h2>
					<p class="text-xl leading-relaxed break-words">{coffee.flavorProfile}</p>
				</div>
			{/if}
			<dl class="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
				{@render Detail('Region', coffee.region)}
				{@render Detail('Farm', coffee.farm)}
				{@render Detail('Producer', coffee.producer)}
				{@render Detail('Process', coffee.processDetails)}
				{@render Detail('Elevation', coffee.elevation)}
			</dl>
			{#if coffee.description}
				<p class="max-w-prose text-base leading-relaxed break-words whitespace-pre-wrap">
					{coffee.description}
				</p>
			{/if}
			{#if !coffee.region && !coffee.farm && !coffee.producer && !coffee.processDetails && !coffee.elevation && !coffee.flavorProfile && !coffee.description && !coffee.notes}
				<p class="text-base-content/60 text-sm">No additional details yet.</p>
			{/if}
			{#if coffee.notes}
				<details class="collapse-arrow border-base-300 collapse rounded-none border-t">
					<summary class="collapse-title min-h-0 py-3 pl-0 text-sm font-medium after:end-1"
						>Personal notes</summary
					>
					<div
						class="collapse-content max-w-prose px-0 text-sm leading-relaxed break-words whitespace-pre-wrap"
					>
						{coffee.notes}
					</div>
				</details>
			{/if}
		</section>

		<section
			class="border-base-300 rounded-box overflow-hidden border"
			aria-labelledby="stock-heading"
		>
			<h2 id="stock-heading" class="px-5 pt-5 text-lg font-semibold tracking-tight sm:px-6 sm:pt-6">
				Stock &amp; doses
			</h2>
			<dl
				class="grid grid-cols-2 items-start gap-6 p-5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center sm:gap-8 sm:p-6"
			>
				<div class="min-w-0 space-y-2 sm:order-1">
					<dt class="text-base-content/65 text-sm">Ready to brew</dt>
					<dd class="text-3xl font-semibold tracking-tight tabular-nums">
						{tubeCount}
						<span class="text-base font-normal">{tubeCount === 1 ? 'tube' : 'tubes'}</span>
					</dd>
					<dd class="text-base-content/60 text-sm tabular-nums">
						{bagCount}
						{bagCount === 1 ? 'bag' : 'bags'}
					</dd>
				</div>
				<div class="space-y-2 justify-self-end text-center sm:order-4">
					<dt class="text-base-content/65 text-sm">Next dose</dt>
					<dd>
						{#if nextTube}
							{@const tubeName = getTubeName(nextTube)}
							<a
								href="/doses/{tubeName}"
								class="btn btn-circle btn-outline btn-primary size-20 border-2 font-mono text-xl"
								aria-label="Open tube {tubeName}">{tubeName}</a
							>
						{:else}
							<span
								class="border-base-300 text-base-content/40 flex size-20 items-center justify-center rounded-full border-2 font-mono text-xl"
								role="img"
								aria-label="No filled tubes">—</span
							>
						{/if}
					</dd>
				</div>
				<div class="min-w-0 space-y-2 sm:order-2">
					<dt class="text-base-content/65 text-sm">Remaining</dt>
					<dd class="text-xl font-semibold tracking-tight tabular-nums">
						{formatWeight(remainingWeight)}<span class="ml-1 text-sm font-normal">g</span>
					</dd>
					<dd class="space-y-2">
						<progress
							class="progress progress-primary block h-1.5 w-full"
							value={progressValue(remainingWeight, coffee.weight)}
							max="100"
							aria-label="Remaining coffee"
						></progress>
						<span class="text-base-content/60 block text-xs"
							>of {formatWeight(coffee.weight)} g total</span
						>
					</dd>
				</div>
				<div class="min-w-0 space-y-2 sm:order-3">
					<dt class="text-base-content/65 text-sm">Undosed</dt>
					<dd class="text-xl font-semibold tracking-tight tabular-nums">
						{formatWeight(undosedWeight)}<span class="ml-1 text-sm font-normal">g</span>
					</dd>
					<dd class="space-y-2">
						<progress
							class="progress block h-1.5 w-full"
							value={progressValue(undosedWeight, coffee.weight)}
							max="100"
							aria-label="Undosed coffee"
						></progress>
						<span class="text-base-content/60 block text-xs">Available to portion</span>
					</dd>
				</div>
			</dl>
			{#key coffeeId}
				<details class="collapse-arrow border-base-300 collapse rounded-none border-t">
					<summary class="collapse-title min-h-0 py-4 pl-5 text-sm font-medium sm:pl-6"
						>Manage tubes &amp; bags</summary
					>
					<div class="collapse-content px-4 sm:px-6">
						<div class="tabs tabs-border w-full min-w-0">
							<label class="tab gap-2 px-3 sm:px-4">
								<input type="radio" name={tabGroup} checked={true} aria-label="Tubes" />
								Tubes <span class="badge badge-ghost badge-sm tabular-nums">{tubeCount}</span>
							</label>
							<div class="tab-content min-w-0 pt-4"><DoseList {coffeeId} /></div>
							<label class="tab gap-2 px-3 sm:px-4">
								<input type="radio" name={tabGroup} aria-label="Bags" />
								Bags <span class="badge badge-ghost badge-sm tabular-nums">{bagCount}</span>
							</label>
							<div class="tab-content min-w-0 pt-4"><BagList {coffeeId} /></div>
						</div>
					</div>
				</details>
			{/key}
		</section>

		<BrewTable {coffeeId} />
	</div>
{/snippet}

{@render CoffeePage()}
