<script lang="ts">
	import type { Dose } from '$lib/zod-schemas';
	import { getCoffeeFlag, getProcessBadgeClass } from '$lib/utils';
	import DoseList from './DoseList.svelte';
	import BrewTable from './BrewTable.svelte';
	import { sum, first } from 'radash';
	import { getTubeName } from '$lib/utils';

	let { data } = $props();
	let coffee = $derived(data.coffee);

	const doses = $derived(coffee.doses as Dose[]);

	const remainingWeight = $derived(coffee.weight - sum(coffee.brews, (brew) => brew.weight));

	const leftToDose = $derived(remainingWeight - sum(doses, (dose) => dose.weight));
	const firstDose = $derived(first(doses));

	const progressBarColor = $derived.by(() => {
		if (remainingWeight < 7) return 'text-error';
		if (remainingWeight < 20) return 'text-warning';
		if (remainingWeight < 0.3 * coffee.weight) return 'text-warning';
		return 'text-success';
	});

	const originInfo = $derived(
		[coffee.farm, coffee.region, coffee.country].filter((v) => v && v !== '').join(', ')
	);
</script>

<div class="w-full max-w-6xl space-y-8">
	<!-- Title Bar -->
	<div class="flex items-start justify-between gap-4">
		<div class="min-w-0 flex-1 space-y-1">
			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
				{`${getCoffeeFlag(coffee)} ${coffee.name}`}
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
			class="col-span-full grid grid-cols-2 gap-4 {firstDose ? 'sm:col-span-2' : 'sm:col-span-3'}"
		>
			{@render InfoCard('Varietals', coffee.varietals ?? 'Unknown')}
			<div class="card bg-base-100">
				<div class="card-body gap-1 p-4">
					<div class="flex items-center gap-2">
						<h3 class="text-base-content/60 text-xs font-medium tracking-wide uppercase">
							Process
						</h3>
						{#if coffee.process}
							<div class="badge badge-sm {getProcessBadgeClass(coffee.process)}">
								{coffee.process}
							</div>
						{/if}
					</div>
					<p class="text-sm font-medium">{coffee.processDetails ?? 'Unknown'}</p>
				</div>
			</div>
			{@render InfoCard('Origin', originInfo === '' ? 'Unknown' : originInfo)}
			{#if coffee.flavorProfile}
				{@render InfoCard('Flavor', coffee.flavorProfile)}
			{/if}
		</div>

		{#if firstDose}
			{@const tubeName = getTubeName(firstDose)}
			<div class="card bg-base-100">
				<div class="card-body gap-1 p-4 sm:items-center sm:justify-center">
					<h3 class="text-base-content/60 text-xs font-medium tracking-wide uppercase">
						Next Dose
					</h3>
					<a href="/doses/{tubeName}" class="link self-start sm:self-auto">
						<div
							class="border-primary bg-base-200 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-[0.25rem]"
						>
							<span class="font-mono text-xl font-bold">{tubeName}</span>
						</div>
					</a>
				</div>
			</div>
		{/if}

		<div class="card bg-base-100">
			<div class="card-body gap-1 p-4 sm:items-center sm:justify-center">
				<h3 class="text-base-content/60 text-xs font-medium tracking-wide uppercase">Remaining</h3>
				<div
					class="radial-progress {progressBarColor} self-start sm:self-auto"
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
				<div class="collapse-title p-4 pb-2 sm:!cursor-auto">
					<h3 class="text-base-content/60 text-xs font-medium tracking-wide uppercase">{title}</h3>
				</div>
				<div class="collapse-content px-4 pt-0">
					<p class="text-sm leading-relaxed">{content}</p>
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

	<div class="grid gap-8 lg:grid-cols-[1fr_auto_1fr]">
		<!-- Doses -->
		<div class="space-y-4">
			<h2 class="text-2xl font-bold">Doses</h2>
			<DoseList
				{doses}
				{leftToDose}
				nextFreeDose={data.nextFreeDose}
				creationForm={data.creationForm}
				managementForm={data.managementForm}
			/>
		</div>

		<div class="divider divider-horizontal hidden lg:flex"></div>

		<!-- Brews -->
		<div class="space-y-4">
			<h2 class="text-2xl font-bold">Brews</h2>
			<BrewTable brews={coffee.brews} />
		</div>
	</div>
</div>
