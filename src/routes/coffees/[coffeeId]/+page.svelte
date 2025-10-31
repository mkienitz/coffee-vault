<script lang="ts">
	import type { Dose } from '$lib/zod-schemas';
	import { superForm } from 'sveltekit-superforms';
	import { getCoffeeFlag, getProcessBadgeClass } from '$lib/utils';
	import { Plus, Trash2 } from 'lucide-svelte';

	let { data } = $props();
	let coffee = $state(data.coffee);

	$effect(() => {
		coffee = data.coffee;
	});

	const doses = $derived(coffee.doses as Dose[]);
	// TODO: sort with recents on top
	const brews = $derived(coffee.brews);
	const leftToDose = $derived(
		coffee.weight -
			brews.reduce((acc, brew) => acc + brew.weight, 0) -
			doses.reduce((acc, dose) => acc + dose.weight, 0)
	);
	const remainingWeight = $derived(
		coffee.weight - brews.reduce((acc, brew) => acc + brew.weight, 0)
	);

	const preselectedDose = $derived(doses[0] ? `${doses[0].drawer}${doses[0].tubeNumber}` : null);

	const progressBarColor = $derived.by(() => {
		if (remainingWeight < 7) {
			return 'text-error';
		} else if (remainingWeight < 20) {
			return 'text-warning';
		} else if (remainingWeight < 0.3 * coffee.weight) {
			return 'text-warning';
		} else {
			return 'text-success';
		}
	});

	const originInfo = $derived(
		[coffee.farm, coffee.region, coffee.country].filter((v) => v && v !== '').join(', ')
	);

	const { form: creationForm, enhance: creationEnhance } = superForm(data.creationForm, {
		resetForm: false
	});
	const { enhance: managementEnhance, formId: managementId } = superForm(data.managementForm);

	let deleteDialogs: Record<string, HTMLDialogElement> = $state({});
</script>

{#snippet InfoCard(label: string, value: string)}
	<div class="card bg-base-100">
		<div class="card-body gap-1 p-4">
			<h3 class="text-base-content/60 text-xs font-medium tracking-wide uppercase">{label}</h3>
			<p class="text-sm font-medium">{value}</p>
		</div>
	</div>
{/snippet}

{#snippet TubeBadge(name: string)}
	<div
		class="bg-base-200 flex h-12 w-12 items-center justify-center rounded-full font-mono text-lg font-bold"
	>
		{name}
	</div>
{/snippet}

{#snippet DeleteDialog(tubeName: string, drawer: string, tubeNumber: number)}
	<dialog bind:this={deleteDialogs[tubeName]} class="modal">
		<div class="modal-box text-left">
			<h3>Are you sure?</h3>
			<p class="py-4">This will delete the dose permanently!</p>
			<div class="modal-action justify-end">
				<form hidden id="managementForm-{tubeName}" method="POST" use:managementEnhance>
					<input hidden name="drawer" value={drawer} />
					<input hidden name="tubeNumber" value={tubeNumber} />
				</form>
				<form method="dialog">
					<button class="btn">Cancel</button>
					<input
						type="submit"
						value="Delete"
						form="managementForm-{tubeName}"
						formaction="?/delete"
						onclick={() => {
							$managementId = tubeName;
						}}
						class="btn btn-error"
					/>
				</form>
			</div>
		</div>
	</dialog>
{/snippet}

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
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:items-start">
		<div
			class="col-span-full grid grid-cols-2 gap-4 {preselectedDose
				? 'sm:col-span-2'
				: 'sm:col-span-3'}"
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

		{#if preselectedDose}
			<div class="card bg-base-100">
				<div class="card-body gap-1 p-4 sm:items-center sm:justify-center">
					<h3 class="text-base-content/60 text-xs font-medium tracking-wide uppercase">
						Next Dose
					</h3>
					<a href="/doses/{preselectedDose}" class="link self-start sm:self-auto">
						<div
							class="border-primary bg-base-200 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-[0.25rem]"
						>
							<span class="font-mono text-xl font-bold">{preselectedDose}</span>
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
			<ul class="list bg-base-100 rounded-box shadow-sm">
				<li class="list-row items-center">
					<form id="creationForm" method="POST" use:creationEnhance class="contents">
						{#if data.nextFreeDose}
							<div
								class="bg-base-200 text-base-content/30 flex h-12 w-12 items-center justify-center rounded-full font-mono text-lg font-bold"
							>
								{data.nextFreeDose.drawer}{data.nextFreeDose.tubeNumber}
							</div>
						{:else}
							<div
								class="bg-error text-error-content/30 flex h-12 w-12 items-center justify-center rounded-full font-mono text-lg font-bold"
							>
								--
							</div>
						{/if}
						{#if data.nextFreeDose}
							<div class="list-col-grow flex items-center gap-2">
								<label class="input input-bordered input-sm w-fit">
									<input
										name="weight"
										type="number"
										min="1"
										max="20"
										placeholder="12.5"
										step="0.5"
										bind:value={$creationForm.weight}
									/>
									<span class="label">g</span>
								</label>
								<span
									class="text-sm {$creationForm.weight > leftToDose
										? 'text-error'
										: 'text-base-content/60'}"
								>
									{leftToDose}g left
								</span>
							</div>
						{:else}
							<div class="list-col-grow">
								<span class="text-error text-sm">No empty tubes available</span>
							</div>
						{/if}
						<button
							type="submit"
							formaction="?/add"
							disabled={!data.nextFreeDose || $creationForm.weight > leftToDose}
							class="btn btn-circle btn-ghost btn-sm enabled:text-success"
						>
							<Plus />
						</button>
					</form>
				</li>
				{#if doses.length === 0}
					<li class="p-12 text-center">
						<p class="text-base-content/60">No doses yet. Add your first dose above!</p>
					</li>
				{:else}
					{#each doses as dose (dose.drawer + dose.tubeNumber)}
						{@const tubeName = `${dose.drawer}${dose.tubeNumber}`}
						<li class="list-row items-center">
							<a href="/doses/{tubeName}">
								{@render TubeBadge(tubeName)}
							</a>
							<div class="list-col-grow">
								<div class="text-sm font-medium">{dose.weight}g</div>
								<div class="text-base-content/60 text-xs">{dose.creationDate}</div>
							</div>
							<button
								class="btn btn-circle btn-ghost text-error btn-sm"
								onclick={() => deleteDialogs[tubeName]?.showModal()}
							>
								<Trash2 />
							</button>
							{@render DeleteDialog(tubeName, dose.drawer, Number(dose.tubeNumber))}
						</li>
					{/each}
				{/if}
			</ul>
		</div>

		<div class="divider divider-horizontal hidden lg:flex"></div>

		<!-- Brews -->
		<div class="space-y-4">
			<h2 class="text-2xl font-bold">Brews</h2>
			{#if brews.length === 0}
				<div class="bg-base-100 rounded-box p-12 text-center shadow-sm">
					<p class="text-base-content/60">There are no recorded brews</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="bg-base-100 table">
						<thead>
							<tr>
								<th>Weight</th>
								<th>Date</th>
							</tr>
						</thead>
						<tbody>
							{#each brews as brew}
								<tr>
									<td>{brew.weight}g</td>
									<td>{brew.consumptionDate}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>
</div>
