<script lang="ts">
	import Plus from 'lucide-svelte/icons/plus';
	import { getAllCoffeeIds } from '$lib/data.remote';
	import CoffeeCard from '$lib/components/CoffeeCard.svelte';
</script>

<div class="fab">
	<div class="tooltip tooltip-left" data-tip="Add new Coffee">
		<a href="/coffees/new" class="btn btn-lg btn-circle btn-success"><Plus /></a>
	</div>
</div>

<div class="mx-auto w-full max-w-screen-2xl p-4">
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each await getAllCoffeeIds() as coffeeId (coffeeId)}
			<!-- <svelte:boundary> -->
			<CoffeeCard {coffeeId} />
			<!-- {#snippet pending()}<div>Loading...</div>{/snippet} -->
			<!-- </svelte:boundary> -->
		{/each}
	</div>
</div>
