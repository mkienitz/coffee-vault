<script lang="ts">
	import CoffeeCard from '$lib/components/coffee-card.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Pagination from '$lib/components/ui/pagination';
	import { MoveLeft, MoveRight } from 'lucide-svelte';

	let { data } = $props();

	const coffees = $state(
		data.coffees.toSorted((a, b) => {
			if (a.roastingDate < b.roastingDate) {
				return 1;
			} else if (a.roastingDate > b.roastingDate) {
				return -1;
			}
			return 0;
		})
	);

	// Pagination
	const pageSize = 8;
	let currPage = $state(1);
	let currCoffees: typeof coffees = $derived(
		coffees.slice((currPage - 1) * pageSize, (currPage - 1) * pageSize + pageSize)
	);
</script>

<div>
	<div class="flex flex-col items-center space-y-4">
		<div class="flex w-full flex-row justify-between">
			<Pagination.Root
				count={coffees.length}
				perPage={pageSize}
				bind:page={currPage}
				let:pages
				let:currentPage
			>
				<Pagination.Content>
					<Pagination.Item>
						<Pagination.PrevButton>
							<MoveLeft />
						</Pagination.PrevButton>
					</Pagination.Item>
					{#each pages as page (page.key)}
						{#if page.type === 'ellipsis'}
							<Pagination.Item>
								<Pagination.Ellipsis />
							</Pagination.Item>
						{:else}
							<Pagination.Item>
								<Pagination.Link {page} isActive={currentPage == page.value}>
									{page.value}
								</Pagination.Link>
							</Pagination.Item>
						{/if}
					{/each}
					<Pagination.Item>
						<Pagination.NextButton>
							<MoveRight />
						</Pagination.NextButton>
					</Pagination.Item>
				</Pagination.Content>
			</Pagination.Root>
		</div>
		<Button href="/coffees">Add a new Coffee</Button>
		<div class="flex flex-row flex-wrap justify-center gap-4">
			{#each currCoffees as coffee}
				<CoffeeCard {coffee} />
			{/each}
		</div>
	</div>
</div>
