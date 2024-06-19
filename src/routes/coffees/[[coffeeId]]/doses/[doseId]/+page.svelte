<script>
	import * as Form from '$lib/components/ui/form';
	const { data } = $props();
	const coffee = data.coffee;
	const dose = data.dose;
</script>

<span>{dose.weight}g of {coffee.name}</span>

<form method="POST">
	<Form.Button formaction="?/consume">Mark as consumed</Form.Button>
</form>
