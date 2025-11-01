<script lang="ts">
	import type { Brew } from '$lib/zod-schemas';

	interface Props {
		brews: Brew[];
	}

	let { brews }: Props = $props();
</script>

{#if brews.length === 0}
	<div class="bg-base-100 rounded-box p-12 text-center shadow-sm">
		<p class="text-base-content/60">There are no recorded brews</p>
	</div>
{:else}
	<div class="overflow-x-auto">
		<table class="bg-base-100 table">
			<thead>
				<tr>
					<th>Weight</th>
					<th>Date</th>
				</tr>
			</thead>
			<tbody>
				{#each brews as brew}
					<tr>
						<td>{brew.weight}g</td>
						<td>{brew.consumptionDate}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
