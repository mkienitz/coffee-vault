<script lang="ts">
	import CoffeeForm from '$lib/components/CoffeeForm.svelte';

	let { data } = $props();
</script>

<CoffeeForm data={data.form} mode="edit" />
