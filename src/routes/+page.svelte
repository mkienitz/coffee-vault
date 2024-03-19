<script lang="ts">
	import CoffeeCard from '$lib/components/coffee-card.svelte';
	import { Button } from '$lib/components/ui/button';
	export let data;
	const coffees = data.coffees.toSorted((a, b) => {
		if (a.roastingDate < b.roastingDate) {
			return 1;
		} else if (a.roastingDate > b.roastingDate) {
			return -1;
		}
		return 0;
	});
</script>

<div class="flex flex-col items-center space-y-4">
	<Button href="/coffees" class="w-fit">Add new Coffee</Button>
	{#each coffees as coffee}
		<CoffeeCard {coffee} />
	{/each}
</div>
