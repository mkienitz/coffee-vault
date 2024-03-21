<script lang="ts">
	import { page } from '$app/stores';
	import CoffeeCard from '$lib/components/coffee-card.svelte';
	import { Button } from '$lib/components/ui/button';
	import { getFlash } from 'sveltekit-flash-message';
	import { toast } from 'svelte-sonner';
	import * as Pagination from '$lib/components/ui/pagination';

	export let data;

	// TODO add more sorting options
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

	// Pagination
	const pageSize = 8;
	let currPage = 1;
	let currCoffees: typeof coffees;
	$: {
		let start = (currPage - 1) * pageSize;
		let end = start + pageSize;
		currCoffees = coffees.slice(start, end);
	}
</script>

<div class="flex flex-col items-center space-y-4">
	<div class="flex w-full flex-row space-x-4">
		<Pagination.Root
			count={coffees.length}
			perPage={pageSize}
			bind:page={currPage}
			let:pages
			let:currentPage
		>
			<Pagination.Content>
				<Pagination.Item>
					<Pagination.PrevButton />
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
					<Pagination.NextButton />
				</Pagination.Item>
			</Pagination.Content>
		</Pagination.Root>
	</div>
	<Button href="/coffees" class="w-fit">Add a new Coffee</Button>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		{#each currCoffees as coffee}
			<CoffeeCard {coffee} class="w-[400px]" />
		{/each}
	</div>
</div>
