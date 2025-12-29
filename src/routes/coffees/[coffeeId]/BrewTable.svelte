<script lang="ts">
	import { getBrews } from './data.remote';
	import { formatDateTime } from '$lib/utils';

	interface Props {
		coffeeId: number;
	}
	let { coffeeId }: Props = $props();

	const brews = $derived(await getBrews(coffeeId));
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
				{#each brews as brew (brew.id)}
					<tr>
						<td>{brew.weight}g</td>
						<td>{formatDateTime(brew.consumptionDate)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
