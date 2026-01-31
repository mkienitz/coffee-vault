<script lang="ts">
	import { formatRoastDate, getCountryFlag, getProcessBadgeClass } from '$lib/utils';
	import { getCoffeeCardData } from './CoffeeCard.remote';
	import { getRemainingWeight } from '../../routes/coffees/[coffeeId]/data.remote';
	import type { Process } from '$lib/types';
	import 'flag-icons/css/flag-icons.min.css';

	interface Props {
		coffeeId: number;
		overrideTube?: string;
	}
	const { coffeeId, overrideTube }: Props = $props();

	const cardDataPromise = $derived(getCoffeeCardData(coffeeId));
	const { coffee, remainingDoses, dosesBrewed, nextTube } = $derived(await cardDataPromise);
	const tube = $derived(overrideTube ?? nextTube);

	const remainingWeightPromise = $derived(getRemainingWeight(coffeeId));
	const remainingWeight = $derived(await remainingWeightPromise);

	const doseCountColor = $derived.by(() => {
		let originalDoses = remainingDoses + dosesBrewed;
		if (remainingDoses <= 1) {
			return 'badge-error';
		} else if (remainingDoses <= 0.4 * originalDoses) {
			return 'badge-warning';
		} else {
			return 'badge-success';
		}
	});

	function getCardClass(process: Process): string {
		switch (process) {
			case 'washed':
				return 'card-info';
			case 'honey':
				return 'card-accent';
			case 'natural':
				return 'card-primary';
			case 'advanced':
				return 'card-secondary';
		}
	}
</script>

<a
	href="/coffees/{coffee.id}"
	class="card card-soft text-base-content {coffee.process
		? getCardClass(coffee.process)
		: ''} shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl {remainingWeight <
	5
		? 'opacity-50 grayscale'
		: ''}"
>
	<div class="card-body relative">
		<!-- Header with flag, name, roaster, and tube indicator -->
		<div class="flex items-center gap-3">
			{#if coffee.country}
				<span class="fi text-3xl fi-{getCountryFlag(coffee.country)}"></span>
			{:else}
				<span>?</span>
			{/if}
			<div class="min-w-0 flex-1">
				<h3 class="card-title text-md leading-tight">{coffee.name}</h3>
				<p class="text-sm opacity-70">{coffee.roaster}</p>
			</div>
			<div class="indicator shrink-0">
				<span
					class="indicator-item badge badge-soft {doseCountColor} flex size-4 -translate-x-1 -translate-y-1 items-center justify-center rounded-full p-0 text-xs font-bold"
				>
					{remainingDoses}
				</span>
				<div
					class="border-base-100 bg-base-200 flex h-14 w-14 items-center justify-center rounded-full border-2 {tube
						? ''
						: 'text-base-content/30'}"
				>
					<span class="font-mono text-sm font-bold">
						{tube ?? '--'}
					</span>
				</div>
			</div>
		</div>

		<!-- Coffee details -->
		<div class="space-y-2 text-sm">
			{#if coffee.process || coffee.varietals}
				<div class="flex flex-wrap items-center gap-2">
					{#if coffee.process}
						<span class="badge badge-soft {getProcessBadgeClass(coffee.process)}">
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
					<div class="text-xs font-semibold tracking-wide uppercase opacity-60">Tastes Like</div>
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
