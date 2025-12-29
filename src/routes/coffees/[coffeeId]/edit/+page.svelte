<script lang="ts">
	import CoffeeForm from '$lib/components/CoffeeForm.svelte';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();
</script>

<CoffeeForm mode="update" coffeeId={Number(params.coffeeId)} />
