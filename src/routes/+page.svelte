<script lang="ts">
	import { goto } from '$app/navigation';
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
	let currPage = $state(data.page);
	let currCoffees = $derived(
		coffees.slice((currPage - 1) * pageSize, (currPage - 1) * pageSize + pageSize)
	);
	$effect(() => {
		goto(`?page=${currPage}`);
	});
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
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- https://stackoverflow.com/questions/71883001/svelte-state-of-components-rendered-with-each-loop -->
			{#each currCoffees as coffee (coffee.id)}
				<CoffeeCard {coffee} />
			{/each}
		</div>
	</div>
</div>
