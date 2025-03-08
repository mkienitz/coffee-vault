<script lang="ts">
	let { data } = $props();
	const doses = data.doses;
</script>

<div>
	<div class="grid grid-cols-8 gap-4">
		{#each doses as dose}
			<a href="/doses/{dose.drawer}{dose.tubeNumber}">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full font-mono
				{dose.coffeeId ? 'bg-error' : 'bg-success'}"
				>
					{dose.drawer}{dose.tubeNumber}
				</div>
			</a>
		{/each}
	</div>
</div>
