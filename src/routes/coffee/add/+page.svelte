<script lang="ts">
	import type { PageData } from './$types.js';
	import AddCoffeeForm from './add-coffee-form.svelte';
	export let data: PageData;
</script>

<AddCoffeeForm {data} class="w-1/2" />
