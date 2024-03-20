<script lang="ts">
	import { page } from '$app/stores';
	import CoffeeCard from '$lib/components/coffee-card.svelte';
	import { Button } from '$lib/components/ui/button';
	import { getFlash } from 'sveltekit-flash-message';
	import { toast } from 'svelte-sonner';
	import { Toaster } from '$lib/components/ui/sonner';

	export let data;
	const coffees = data.coffees.toSorted((a, b) => {
		if (a.roastingDate < b.roastingDate) {
			return 1;
		} else if (a.roastingDate > b.roastingDate) {
			return -1;
		}
		return 0;
	});

	// Toaster
	const flash = getFlash(page);
	$: {
		if ($flash) {
			toast.success($flash.message);
		}
	}
</script>

<Toaster richColors />
<div class="flex flex-col items-center space-y-4">
	<Button href="/coffees" class="w-fit">Add new Coffee</Button>
	{#each coffees as coffee}
		<CoffeeCard {coffee} />
	{/each}
</div>
