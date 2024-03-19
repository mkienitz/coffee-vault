<script lang="ts">
	import CoffeeCard from '$lib/components/coffee-card.svelte';
	import { Button } from '$lib/components/ui/button';
	export let data;
</script>

<div class="flex flex-col space-y-4">
	<Button href="/coffees">Add new Coffee</Button>
	{#each data.coffees as coffee}
		<CoffeeCard {coffee} />
	{/each}
</div>
