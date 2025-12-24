<script lang="ts">
	import { getCountryCode, getEmojiFlag, type TCountryCode } from 'countries-list';
	import { Plus } from 'lucide-svelte';
	import { getTubeName, getProcessBadgeClass } from '$lib/utils';

	let { data } = $props();
	const coffees = $state(data.coffees);

	type CoffeeData = (typeof coffees)[number];

	function getDoseCountColor(coffee: CoffeeData) {
		let originalDoses = coffee.dosesRemaining + coffee.dosesBrewed;
		if (coffee.dosesRemaining <= 1) {
			return 'badge-error';
		} else if (coffee.dosesRemaining <= 0.4 * originalDoses) {
			return 'badge-warning';
		} else {
			return 'badge-success';
		}
	}

	function formatRoastDate(dateString: string): string {
		return (
			'R.' +
			new Date(dateString).toLocaleDateString('en-GB', {
				day: 'numeric',
				month: 'numeric',
				year: '2-digit'
			})
		);
	}
</script>

<div class="fab">
	<div class="tooltip tooltip-left" data-tip="Add new Coffee">
		<a href="/coffees/new" class="btn btn-lg btn-circle btn-success"><Plus /></a>
	</div>
</div>

<div class="mx-auto w-full max-w-screen-2xl p-4">
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each coffees as coffee (coffee.id)}
			<a
				href="/coffees/{coffee.id}"
				class="card border-base-300/50 bg-base-100 border shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl {coffee.dosesRemaining ===
				0
					? 'opacity-50 grayscale'
					: ''}"
			>
				<div class="card-body relative p-6">
					<!-- Header with flag, name, roaster, and tube indicator -->
					<div class="mb-4 flex items-center gap-3">
						<div class="text-2xl leading-none">
							{#if coffee.country}
								{getEmojiFlag(getCountryCode(coffee.country) as TCountryCode)}
							{:else}
								❔
							{/if}
						</div>
						<div class="min-w-0 flex-1">
							<h3 class="card-title text-lg leading-tight">{coffee.name}</h3>
							<p class="text-sm opacity-70">{coffee.roaster}</p>
						</div>
						<div class="indicator shrink-0">
							<span
								class="indicator-item badge {getDoseCountColor(
									coffee
								)} flex size-5 -translate-x-1 -translate-y-1 items-center justify-center rounded-full p-0 text-xs font-bold"
							>
								{coffee.dosesRemaining}
							</span>
							<div
								class="border-primary bg-base-200 flex h-12 w-12 items-center justify-center rounded-full border-2 {coffee.firstDose
									? ''
									: 'text-base-content/30'}"
							>
								<span class="font-mono text-sm font-bold">
									{coffee.firstDose ? getTubeName(coffee.firstDose) : '--'}
								</span>
							</div>
						</div>
					</div>

					<!-- Coffee details -->
					<div class="space-y-2 text-sm">
						{#if coffee.process || coffee.varietals}
							<div class="flex flex-wrap items-center gap-2">
								{#if coffee.process}
									<span class="badge {getProcessBadgeClass(coffee.process)}">
										{coffee.process}
									</span>
								{/if}
								{#if coffee.varietals}
									<span>{coffee.varietals}</span>
								{/if}
							</div>
						{/if}

						{#if coffee.flavorProfile}
							<div class="mt-2">
								<div class="text-xs font-semibold tracking-wide uppercase opacity-60">
									Flavor Notes
								</div>
								<div class="mt-0.5">{coffee.flavorProfile}</div>
							</div>
						{:else if !coffee.process && !coffee.varietals}
							<div class="text-xs italic opacity-40">No details available</div>
						{/if}
					</div>

					<!-- Roasting date in bottom right corner -->
					{#if coffee.roastingDate}
						<div class="text-base-content/40 absolute right-3 bottom-2 text-xs font-light">
							{formatRoastDate(coffee.roastingDate)}
						</div>
					{/if}
				</div>
			</a>
		{/each}
	</div>
</div>
